import { basekit, FieldType, field, FieldComponent, FieldCode, AuthorizationType } from '@lark-opdev/block-basekit-server-api';
const { t } = field;


const feishuDm = ['feishu.cn', 'feishucdn.com', 'larksuitecdn.com', 'larksuite.com','api.chatfire.cn','api.xunkecloud.cn', 'token.yishangcloud.cn'];
basekit.addDomainList([...feishuDm, 'api.exchangerate-api.com']);

basekit.addField({
  i18n: {
     messages: {
      'zh-CN': {
        'inputCommand': '要生成的文本',
        'refAtt': '参考音频附件',
      },
       'en-US': {
        'inputCommand': 'Input command',
        'refAtt': 'Reference attachment',
      }, 
      'ja-JP': {
        'inputCommand': '入力コマンド',
        'refAtt': '参考音频附件',
      }
    }
  },
  formItems: [ 
    {
      key: 'inputCommand',
      label: t('inputCommand'),
      component: FieldComponent.Input,
      props: {
        placeholder: '请输入要用克隆语音朗读的文本',
      },
      validator: {
        required: true,
      }
    },
    {
      key: 'refAtt',
      label: t('refAtt'),
      component: FieldComponent.FieldSelect,
      props: {
        supportType: [FieldType.Attachment],
      }
    }
  ],

  resultType: {
    type: FieldType.Attachment
  },

  execute: async (formItemParams, context) => {
    const { inputCommand, refAtt} = formItemParams;

    function debugLog(arg: any) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        ...arg
      }));
    }

    try {

       if (!(context as any).hasQuota) {
        debugLog({'=0 无配额': { tableID: (context as any).tableID,baseOwnerID: (context as any).baseOwnerID }});
        return { code: FieldCode.QuotaExhausted };
      }

    const createImageUrl = `https://api.xunkecloud.cn/openai/v1/audio/speech` 
      // 提取图片链接函数
      

      let taskResp;
      
        const jsonRequestOptions = {
          method: 'POST',
          headers: {'Content-Type': 'application/json',"Authorization": "Bearer sk-s5XX6b82fFcySyQYcp8aOvkJqoud1K0IIec7ewcYnuBRomHN"},
          body: JSON.stringify({
            model: "IndexTTS-1.5",
            "input": inputCommand,
            "prompt_wav_url": refAtt,
            "response_format":"url",
          })
        };
        
        
        taskResp = await context.fetch(createImageUrl, jsonRequestOptions);
        taskResp = await taskResp.json();
       let dataMp3 = taskResp.audio;
       console.log('===100 响应参数', dataMp3);
       
       const fileName = dataMp3.split('/').pop();

      return {
          code: FieldCode.Success, // 0 表示请求成功
          data: [
            {
              "name": fileName, // 附件名称,需要带有文件格式后缀
              "content": dataMp3, // 可通过http.Get 请求直接下载的url.
              "contentType": "attachment/url", // 固定值
            }
          ],
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
    