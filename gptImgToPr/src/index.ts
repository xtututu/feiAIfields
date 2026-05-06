import { basekit, FieldType, field, FieldComponent, FieldCode, AuthorizationType } from '@lark-opdev/block-basekit-server-api';
const { t } = field;


const feishuDm = ['feishu.cn', 'feishucdn.com', 'larksuitecdn.com', 'larksuite.com','api.chatfire.cn','api.xunkecloud.cn', 'token.yishangcloud.cn'];
basekit.addDomainList([...feishuDm, 'api.exchangerate-api.com']);

basekit.addField({
  i18n: {
    messages: {
      'zh-CN': {
        'imagePrompt': '提示词',
        'refImage': '参考图片',
        'aspectRatio': '图像比例',
      },
      'en-US': {
        'imagePrompt': 'Image editing prompt',
        'refImage': 'Reference image',
        'aspectRatio': 'Aspect ratio',
      },
      'ja-JP': {
        'imagePrompt': '画像編集提示詞',
        'refImage': '参考画像',
        'aspectRatio': '画像比例',
      },
    }
  },


  formItems: [ 
     
    {
      key: 'imagePrompt',
      label: t('imagePrompt'),
      component: FieldComponent.Input,
      
      props: {
        placeholder: '自然语言说出要求，例如：将图片中的手机去掉（使用翻译后提示词效果更佳）',
      },
      validator: {
        required: true,
      }
    },
    {
      key: 'refImage',
      label: t('refImage'),
      component: FieldComponent.FieldSelect,
      props: {
        mode: 'multiple',
        supportType: [FieldType.Attachment],
      }
    },

    {
      key: 'aspectRatio',
      label: t('aspectRatio'),
      component: FieldComponent.SingleSelect,
      defaultValue: { label: t('auto'), value: 'auto'},
      props: {
        options: [
          { label: 'auto', value: 'auto' },
          { label: '1:1', value: '1:1' },
          { label: '3:2', value: '3:2' },
          { label: '2:3', value: '2:3' },
          { label: '16:9', value: '16:9' },
          { label: '9:16', value: '9:16' },
          { label: '4:3', value: '4:3' },
          { label: '3:4', value: '3:4' },
          { label: '21:9', value: '21:9' },
          { label: '9:21', value: '9:21' },
          { label: '1:3', value: '1:3' },
          { label: '3:1', value: '3:1' },
          { label: '2:1', value: '2:1' },
          { label: '1:2', value: '1:2' }
        ]
      },
    },
  ],

  resultType: {
    type: FieldType.Attachment
  },

  execute: async (formItemParams, context) => {
    const { imagePrompt, refImage ,aspectRatio} = formItemParams;
    let englishPrompt = imagePrompt;

    function debugLog(arg: any) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        ...arg
      }));
    }
   function extractAllTmpUrls(data) {
    // 存储所有提取到的 tmp_url
    const tmpUrlList = [];

    // 递归遍历函数
    function traverse(currentData) {
        // 跳过 null/undefined
        if (currentData === null || typeof currentData === 'undefined') {
            return;
        }

        // 如果是对象（数组/普通对象）
        if (typeof currentData === 'object') {
            // 检查当前对象是否有有效 tmp_url
            if (
                'tmp_url' in currentData && 
                typeof currentData.tmp_url === 'string' && 
                currentData.tmp_url.trim()
            ) {
                tmpUrlList.push(currentData.tmp_url.trim());
            }

            // 遍历所有子元素（跳过原型链属性）
            for (const key in currentData) {
                if (currentData.hasOwnProperty(key)) {
                    traverse(currentData[key]);
                }
            }
        }
    }

    // 开始遍历传入的数据
    traverse(data);
    // 返回去重后的数组（可选：如果需要去重则加，不需要则直接返回 tmpUrlList）
    return [...new Set(tmpUrlList)];
}

    try {

       if (!(context as any).hasQuota) {
        debugLog({'=0 无配额': { tableID: (context as any).tableID,baseOwnerID: (context as any).baseOwnerID }});
        return { code: FieldCode.QuotaExhausted };
      }

    const createImageUrl = `http://api.xunkecloud.cn/v1/images/generations` 
      // 提取图片链接函数
    

      let taskResp;
      
    
        // 创建请求体，根据是否有图片URL决定是否包含image字段
        const requestBody: any = {
          model: "gpt-image-2",
          prompt: imagePrompt,
          aspect_ratio: aspectRatio.value,
          picType:"png"
        };
        
        
        const imageUrls = extractAllTmpUrls(refImage);
        if (imageUrls.length > 0) {
          requestBody.image = imageUrls;
        }
        
        const jsonRequestOptions = {
          method: 'POST',
          headers: {'Content-Type': 'application/json',"Authorization": "Bearer sk-2XAYSwa0hh4T7o3ZZQlaUdybCvvz3hPUvEIN2P1JA0lH6WyF"},
          body: JSON.stringify(requestBody)
        };
        console.log(jsonRequestOptions);
        
        
        taskResp = await context.fetch(createImageUrl, jsonRequestOptions);
      

      if (!taskResp) {
        throw new Error('请求未能成功发送');
      }

      debugLog({'=1 图片创建接口结果': taskResp});
      
      if (!taskResp.ok) {
        const errorData = await taskResp.json().catch(() => ({}));
        console.error('API请求失败:', taskResp.status, errorData);
        
        // 检查HTTP错误响应中的无效令牌错误
        if (errorData.error && errorData.error.message ) {
          throw new Error(errorData.error.message);
        }
        
        throw new Error(`API请求失败: ${taskResp.status} ${taskResp.statusText}`);
      }
      
      const initialResult = await taskResp.json();

      console.log('initialResult:', initialResult.data);
      
      // 检查API返回的余额耗尽错误
      
      
      if (!initialResult || !initialResult.data || !Array.isArray(initialResult.data) || initialResult.data.length === 0) {
        throw new Error('API响应数据格式不正确或为空');
      }
      
      
      // let chatfireNanoUrl = initialResult.data[0].url;
      let imageUrl = initialResult.data[0].url;

      console.log('imageUrl:', imageUrl);

      const url = [
        {
          type: 'url',
          text: englishPrompt,
          link: imageUrl
        }
      ];


      return {
          code: FieldCode.Success, // 0 表示请求成功
          // data 类型需与下方 resultType 定义一致
          data: (url.map(({ link }, index) => {            
            if (!link || typeof link !== 'string') {
              return undefined
            }
            const name = link.split('/').slice(-1)[0];
            return {
              name:  name+'.png',
              content: link,
              contentType: "attachment/url"
            }
          })).filter((v) => v)
        };

    } catch (e) {
      console.log('====error', String(e));
      debugLog({ '===999 异常错误': String(e) });

       if (String(e).includes('无可用渠道')) {
        
        return {
          code: FieldCode.InvalidArgument, // 0 表示请求成功
          
        };
      }
      // 检查错误消息中是否包含余额耗尽的信息
      if (String(e).includes('令牌额度已用尽')) {
        return {
          code: FieldCode.QuotaExhausted, // 0 表示请求成功
         
        };
      }
       if (String(e).includes('无效的令牌')) {
        
        return {
        code: FieldCode.ConfigError, // 0 表示请求成功
        }
      }

      return { code: FieldCode.Error };
    }
  }
});

export default basekit;
    