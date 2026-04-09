import { basekit, FieldType, field, FieldComponent, FieldCode, AuthorizationType } from '@lark-opdev/block-basekit-server-api';
const { t } = field;


const feishuDm = ['feishu.cn', 'feishucdn.com', 'larksuitecdn.com', 'larksuite.com','api.xunkecloud.cn',];
basekit.addDomainList([...feishuDm, 'api.exchangerate-api.com']);

basekit.addField({
  i18n: {
    messages: {
      'zh-CN': {
        'videoMethod': '模型选择',
        'imagePrompt': '提示词',
        'refImage': '参考图片',
        'modelBrand':'迅客',
        'aspectRatio': '图像比例',
        'genQty': '生成数量',
      },
      'en-US': {
        'videoMethod': 'Model selection',
        'imagePrompt': 'Image editing prompt',
        'refImage': 'Reference image',
        'modelBrand':'Xunke',
        'aspectRatio': 'Aspect ratio',
        'genQty': '生成数量',
      },
      'ja-JP': {
        'videoMethod': '画像生成方式',
        'imagePrompt': '画像編集提示詞',
        'refImage': '参考画像',
        'modelBrand':'迅客',
        'aspectRatio': '画像比例',
        'genQty': '生成数量',
      },
    }
  },

  authorizations: [
    {
      id: 'auth_id_1',
      platform: 'xunkecloud',
      type: AuthorizationType.HeaderBearerToken,
      required: true,
      instructionsUrl: "http://api.xunkecloud.cn/login",
      label: '关联账号',
      icon: {
        light: '',
        dark: ''
      }
    }
  ],

  formItems: [ 
     {
      key: 'videoMethod',
      label: t('videoMethod'),
      component: FieldComponent.SingleSelect,
      defaultValue: { label: t('modelBrand') +' Na', value: 'nano-banana'},
      props: {
        options: [
          { label: t('modelBrand') +' Na', value: 'nano-banana'},
          { label: t('modelBrand') +' Na-Pro', value: 'nano-banana-pro'},
          { label: t('modelBrand') +' Na-Pro-1K', value: 'nano-banana-pro_1K'},
          { label: t('modelBrand') +' Na-Pro-2k', value: 'nano-banana-pro_2k'},
          { label: t('modelBrand') +' Na-Pro-4k', value: 'nano-banana-pro_4k'},
          { label: t('modelBrand') +' Na-Ba2-1K', value: 'nano-banana2-1K'},
          { label: t('modelBrand') +' Na-Ba2-2K', value: 'nano-banana2-2K'},
          { label: t('modelBrand') +' Na-Ba2-4K', value: 'nano-banana2-4K'},
        ]
      },
    },
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
      defaultValue: { label: 'auto', value: 'auto'},
      props: {
        options: [
          { label: 'auto', value: 'auto'},
          { label: '1:1', value: '1:1'},
          { label: '16:9', value: '16:9'},
          { label: '9:16', value: '9:16'},
          { label: '4:3', value: '4:3'},
          { label: '3:4', value: '3:4'},
          { label: '3:2', value: '3:2'},
          { label: '2:3', value: '2:3'},
          { label: '5:4', value: '5:4'},
          { label: '4:5', value: '4:5'},
          { label: '21:9', value: '21:9'},
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
    const { videoMethod, imagePrompt, refImage, aspectRatio, genQty } = formItemParams;
    let englishPrompt = imagePrompt;

    function debugLog(arg: any) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        ...arg
      }));
    }
      const createErrorResponse = (name: string, videoUrl: string) => ({
      code: FieldCode.Success,
      data: [{
        name: `${name}.mp4`,
        content: videoUrl,
        contentType: 'attachment/url'
      }]
    });
     const ERROR_VIDEOS = {
      DEFAULT: 'https://pay.xunkecloud.cn/image/Wrong.mp4',
      OVERRUN: 'https://pay.xunkecloud.cn/image/Overrun.mp4',
      NO_CHANNEL: 'https://pay.xunkecloud.cn/image/unusual.mp4',
      INSUFFICIENT: 'https://pay.xunkecloud.cn/image/Insufficient.mp4',
      INVALID_TOKEN: 'https://pay.xunkecloud.cn/image/tokenError.mp4',
      TIME_FAILED: 'https://pay.xunkecloud.cn/image/timeFailed.png',
      PROMPT_ERROR: 'https://pay.xunkecloud.cn/image/promtErr.mp4',
    };

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
      // 检查提示词是否为空
      if (!imagePrompt || imagePrompt.trim() === '') {        
        return createErrorResponse('提示词必填', ERROR_VIDEOS.PROMPT_ERROR) ;
      }

const createImageUrl = `https://api.xunkecloud.cn/v1/images/generations` 

      
        const jsonRequestOptions = {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            model: videoMethod.value,
            "prompt": imagePrompt,
            "image": extractAllTmpUrls(refImage),
            "response_format":"url",
            "aspect_ratio": aspectRatio.value,
            "picType":"jpg"
          })
        };

        console.log(jsonRequestOptions);
        
     const quantity = parseInt(genQty?.value || genQty || '1', 10);
    
    // 创建并发请求
    const promises = Array.from({ length: quantity }, async (_, index) => {
      const taskResp = await context.fetch(createImageUrl, jsonRequestOptions, 'auth_id_1');
      
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
      name: `image_${index + 1}.jpg`,
      content: url,
      contentType: "attachment/url"
    }));

      return {
          code: FieldCode.Success, // 0 表示请求成功
          // data 类型需与下方 resultType 定义一致
          data: data
        };
    } catch (error: any) {
     const errorMessage = String(error);
      debugLog({ '异常错误': errorMessage });

      // 根据错误类型返回相应的错误视频
      if (errorMessage.includes('无可用渠道')) {
        debugLog({ message: '无可用渠道', errorType: '渠道错误', errorMessage });
        return createErrorResponse('捷径异常', ERROR_VIDEOS.NO_CHANNEL);
      } else if (errorMessage.includes('令牌额度已用尽')||errorMessage.includes('余额')||errorMessage.includes('quota')) {
        debugLog({ message: '令牌额度已用尽', errorType: '余额不足', errorMessage });
        return createErrorResponse('余额耗尽', ERROR_VIDEOS.INSUFFICIENT);
      } else if (errorMessage.includes('令牌')||errorMessage.includes('token')) {
        debugLog({ message: '无效的令牌', errorType: '令牌错误', errorMessage });
        return createErrorResponse('无效的令牌', ERROR_VIDEOS.INVALID_TOKEN);
      }

      console.log("==========");
      
      // 未知错误
      return {
      code: FieldCode.Success,
      data: [{
        name: 'timeFailed.png',
        content: ERROR_VIDEOS.TIME_FAILED,
        contentType: 'attachment/url'
      }]
    };
    }
  }
});

export default basekit;
    