import { basekit, FieldType, field, FieldComponent, FieldCode, AuthorizationType } from '@lark-opdev/block-basekit-server-api';
const { t } = field;


const feishuDm = ['feishu.cn', 'feishucdn.com', 'larksuitecdn.com', 'larksuite.com','api.chatfire.cn','api.xunkecloud.cn', 'token.yishangcloud.cn'];
basekit.addDomainList([...feishuDm, 'api.exchangerate-api.com']);

basekit.addField({
  i18n: {
    messages: {
      'zh-CN': {
        'imagePrompt': '提示词',
        'refImage': '参考图片（支持多图）',
        'size': '图片尺寸',
        'genQty': '生成数量',
        // 'aspectRatio': '图像比例',
      },
      'en-US': {
        'imagePrompt': 'Image editing prompt',
        'refImage': 'Reference image（Support multiple images）',
        'size': 'Image size',
        'genQty': 'Generate quantity',
        // 'aspectRatio': 'Aspect ratio',
      },
      'ja-JP': {
        'imagePrompt': '画像編集提示詞',
        'refImage': '参考画像（Support multiple images）',
        'size': '画像サイズ',
        'genQty': '生成数量',
        // 'aspectRatio': '画像比例',
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
      key: 'size',
      label: t('size'),
      component: FieldComponent.SingleSelect,
      defaultValue: { label: '2K', value: '2K'},
      props: {
        options: [
          { label:"2K", value:"2K"},
          { label:"3K", value:"3K"},
          { label:"2K (1:1 2048X2048)", value:"2048X2048"},
          { label:"2K (4:3 2304X1728)", value:"2304X1728"},
          { label:"2K (3:4 1728X2304)", value:"1728X2304"},
          { label:"2K (16:9 2848X1600)", value:"2848X1600"},
          { label:"2K (9:16 1600X2848)", value:"1600X2848"},
          { label:"2K (3:2 2496X1664)", value:"2496X1664"},
          { label:"2K (2:3 1664X2496)", value:"1664X2496"},
          { label:"2K (21:9 3136X1344)", value:"3136X1344"},
          { label:"3K (1:1 3072X3072)", value:"3072X3072"},
          { label:"3K (4:3 3456X2592)", value:"3456X2592"},
          { label:"3K (3:4 2592X3456)", value:"2592X3456"},
          { label:"3K (16:9 4096X2304)", value:"4096X2304"},
          { label:"3K (9:16 2304X4096)", value:"2304X4096"},
          { label:"3K (2:3 2496X3744)", value:"2496X3744"},
          { label:"3K (3:2 3744X2496)", value:"3744X2496"},
          { label:"3K (21:9 4704X2016)", value:"4704X2016"}
        ]
      },
    },
    {
      key: 'genQty',
      label: t('genQty'),
      component: FieldComponent.SingleSelect,
      defaultValue: { label: '1', value: '1'},
      props: {
        options: [
          { label:"1", value:"1"},
          { label:"2", value:"2"},
          { label:"3", value:"3"},
          { label:"4", value:"4"},
          { label:"5", value:"5"}
        ]
      },
    }
  ],

  resultType: {
    type: FieldType.Attachment
  },

  execute: async (formItemParams, context) => {
    const { imagePrompt, refImage ,size,genQty} = formItemParams;
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
    

    
    // 创建请求体，根据是否有图片URL决定是否包含image字段
    const requestBody: any = {
      model: "doubao-seedream-5-0-260128",
      prompt: imagePrompt,
      response_format: "url",
      size: size.value,
      image: extractAllTmpUrls(refImage),
    };
    

    const jsonRequestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json',"Authorization": "Bearer sk-2XAYSwa0hh4T7o3ZZQlaUdybCvvz3hPUvEIN2P1JA0lH6WyF"},
      body: JSON.stringify(requestBody)
    };
    debugLog({ [`=1 图片创建接口请求体`]: requestBody});
    
    // 解析genQty为数字，默认为1
    const quantity = parseInt(genQty?.value || genQty || '1', 10);
    
    // 创建并发请求
    const promises = Array.from({ length: quantity }, async (_, index) => {
      const taskResp = await context.fetch(createImageUrl, jsonRequestOptions);
      
      if (!taskResp) {
        throw new Error(`请求 ${index + 1} 未能成功发送`);
      }

      debugLog({ [`=1 图片创建接口结果 ${index + 1}`]: taskResp});
      
      if (!taskResp.ok) {
        const errorData: any = await taskResp.json().catch(() => ({}));
        console.error(`API请求 ${index + 1} 失败:`, taskResp.status, errorData);
        
        // 检查HTTP错误响应中的无效令牌错误
        if (errorData.error && errorData.error.message ) {
          throw new Error(errorData.error.message);
        }
        
        throw new Error(`API请求 ${index + 1} 失败: ${taskResp.status} ${taskResp.statusText}`);
      }
      
      const result: any = await taskResp.json();

      
      // 检查API返回的余额耗尽错误
      if (!result || !result.data || !Array.isArray(result.data) || result.data.length === 0) {
        throw new Error(`API响应 ${index + 1} 数据格式不正确或为空`);
      }
      
      return result.data[0].url;
    });
    
    // 等待所有请求完成
    const imageUrls = await Promise.all(promises);
    console.log('All image URLs:', imageUrls);
    
    // 构建返回数据
    const data = imageUrls.map((url, index) => ({
      name: `image_${index + 1}.png`,
      content: url,
      contentType: "attachment/url"
    }));

      return {
          code: FieldCode.Success, // 0 表示请求成功
          // data 类型需与下方 resultType 定义一致
          data: data
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
    