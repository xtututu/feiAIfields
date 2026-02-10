import { basekit, FieldType, field, FieldComponent, FieldCode, AuthorizationType } from '@lark-opdev/block-basekit-server-api';
const { t } = field;


const feishuDm = ['feishu.cn', 'feishucdn.com', 'larksuitecdn.com', 'larksuite.com','api.chatfire.cn','api.xunkecloud.cn', 'token.yishangcloud.cn'];
basekit.addDomainList([...feishuDm, 'api.exchangerate-api.com']);

basekit.addField({
  i18n: {
     messages: {
      'zh-CN': {
        'inputCommand': '要生成的文本',
        'toneMethod': '选择音色',
      },
       'en-US': {
        'inputCommand': 'Input command',
        'toneMethod': 'Tone method',
      }, 
      'ja-JP': {
        'inputCommand': '入力コマンド',
        'toneMethod': '音色方法',
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
      key: 'toneMethod',
      label: t('toneMethod'),
      component: FieldComponent.SingleSelect,
      defaultValue: { label: '青涩青年音色', value: 'male-qn-qingse' },
      props: {
        options: [
          { label: '青涩青年音色', value: 'male-qn-qingse' },
          { label: '精英青年音色', value: 'male-qn-jingying' },
          { label: '霸道青年音色', value: 'male-qn-badao' },
          { label: '青年大学生音色', value: 'male-qn-daxuesheng' },
          { label: '少女音色', value: 'female-shaonv' },
          { label: '御姐音色', value: 'female-yujie' },
          { label: '成熟女性音色', value: 'female-chengshu' },
          { label: '甜美女性音色', value: 'female-tianmei' },
          { label: '男性主持人', value: 'presenter_male' },
          { label: '女性主持人', value: 'presenter_female' },
          { label: '男性有声书 1', value: 'audiobook_male_1' },
          { label: '男性有声书 2', value: 'audiobook_male_2' },
          { label: '女性有声书 1', value: 'audiobook_female_1' },
          { label: '女性有声书 2', value: 'audiobook_female_2' },
          { label: '青涩青年音色-beta', value: 'male-qn-qingse-jingpin' },
          { label: '精英青年音色-beta', value: 'male-qn-jingying-jingpin' },
          { label: '霸道青年音色-beta', value: 'male-qn-badao-jingpin' },
          { label: '青年大学生音色-beta', value: 'male-qn-daxuesheng-jingpin' },
          { label: '少女音色-beta', value: 'female-shaonv-jingpin' },
          { label: '御姐音色-beta', value: 'female-yujie-jingpin' },
          { label: '成熟女性音色-beta', value: 'female-chengshu-jingpin' },
          { label: '甜美女性音色-beta', value: 'female-tianmei-jingpin' },
          { label: '聪明男童', value: 'clever_boy' },
          { label: '可爱男童', value: 'cute_boy' },
          { label: '萌萌女童', value: 'lovely_girl' },
          { label: '卡通猪小琪', value: 'cartoon_pig' },
          { label: '病娇弟弟', value: 'bingjiao_didi' },
          { label: '俊朗男友', value: 'junlang_nanyou' },
          { label: '纯真学弟', value: 'chunzhen_xuedi' },
          { label: '冷淡学长', value: 'lengdan_xiongzhang' },
          { label: '霸道少爷', value: 'badao_shaoye' },
          { label: '甜心小玲', value: 'tianxin_xiaoling' },
          { label: '俏皮萌妹', value: 'qiaopi_mengmei' },
          { label: '妩媚御姐', value: 'wumei_yujie' },
          { label: '嗲嗲学妹', value: 'diadia_xuemei' },
          { label: '淡雅学姐', value: 'danya_xuejie' },
          { label: 'Santa Claus', value: 'Santa_Claus' },
          { label: 'Grinch', value: 'Grinch' },
          { label: 'Rudolph', value: 'Rudolph' },
          { label: 'Arnold', value: 'Arnold' },
          { label: 'Charming Santa', value: 'Charming_Santa' },
          { label: 'Charming Lady', value: 'Charming_Lady' },
          { label: 'Sweet Girl', value: 'Sweet_Girl' },
          { label: 'Cute Elf', value: 'Cute_Elf' },
          { label: 'Attractive Girl', value: 'Attractive_Girl' },
          { label: 'Serene Woman', value: 'Serene_Woman' }
        ]
      },
    },
  ],

  resultType: {
    type: FieldType.Attachment
  },

  execute: async (formItemParams, context) => {
    const { inputCommand, toneMethod} = formItemParams;

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

    const createImageUrl = `https://api.xunkecloud.cn/v1/audio/speech` 
      // 提取图片链接函数
      

      let taskResp;
      
        const jsonRequestOptions = {
          method: 'POST',
          headers: {'Content-Type': 'application/json',"Authorization": "Bearer sk-s5XX6b82fFcySyQYcp8aOvkJqoud1K0IIec7ewcYnuBRomHN"},
          body: JSON.stringify({
            model: "minimax-speech-02-turbo",
            "input": inputCommand,
            "voice": toneMethod.value,
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
    