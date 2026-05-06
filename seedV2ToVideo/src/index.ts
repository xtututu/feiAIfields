import { basekit, FieldType, field, FieldComponent, FieldCode, NumberFormatter, AuthorizationType } from '@lark-opdev/block-basekit-server-api';
const { t } = field;

const feishuDm = ['feishu.cn', 'feishucdn.com', 'larksuitecdn.com', 'larksuite.com','api.chatfire.cn','api.xunkecloud.cn','api.xunkecloud.cn',];
// 通过addDomainList添加请求接口的域名，不可写多个addDomainList，否则会被覆盖
basekit.addDomainList([...feishuDm, 'api.exchangerate-api.com',]);

basekit.addField({
  // 定义捷径的i18n语言资源
   i18n: {
    messages: {
      'zh-CN': {
        'videoMethod': '模型选择',
        'videoPrompt': '视频提示词',
        'refImage': '参考图片',
        'refVideo': '参考视频',
        'refAudio': '参考音频',
        'seconds': '视频时长',
        'size': '视频尺寸',
        'videoResolution': '视频分辨率',
      },
      'en-US': {
        'videoMethod': 'Model selection',
        'videoPrompt': 'Video prompt',
        'refImage': 'Reference image',
        'refVideo': 'Reference video',
        'refAudio': 'Reference audio',
        'seconds': 'Video duration',
        'size': 'Video size',   
        'videoResolution': 'Video resolution',
      },
      'ja-JP': {
        'videoMethod': 'モデル選択',
        'videoPrompt': 'ビデオ提示词',
        'refImage': '参考画像',
        'refVideo': '参考動画',
        'refAudio': '参考音声', 
        'seconds': 'ビデオ再生時間',
        'size': 'ビデオサイズ',   
        'videoResolution': 'ビデオ解像度',
      },
    }
  },

  authorizations: [
    {
      id: 'auth_id_1',
      platform: 'base',
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
  // 定义捷径的入参
  formItems: [ 
    {
      key: 'videoMethod',
      label: t('videoMethod'),
      component: FieldComponent.SingleSelect,
      defaultValue: { label: 'doubao-seedance-2-0', value: 'doubao-seedance-2-0'},
      props: {
        options: [
          { label: 'doubao-seedance-2-0', value: 'doubao-seedance-2-0'},
          { label: 'doubao-seedance-2-0-fast', value: 'doubao-seedance-2-0-fast'},
        ]
      },
    },
    {
      key: 'videoPrompt',
      label: t('videoPrompt'),
      component: FieldComponent.Input,
      props: {
        placeholder: '请输入视频提示词',
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
        placeholder: '请选择参考图片',
      }
    },
    {
      key: 'refVideo',
      label: t('refVideo'),
      component: FieldComponent.FieldSelect,
       props: {
        mode: 'multiple',
        supportType: [FieldType.Attachment],
        placeholder: '请选择参考视频',
      }
    },
    {
      key: 'refAudio',
      label: t('refAudio'),
      component: FieldComponent.FieldSelect,
       props: {
        mode: 'multiple',
        supportType: [FieldType.Attachment],
        placeholder: '请选择参考音频',
      }
    },
    {
      key: 'seconds',
      label: t('seconds'),
      component: FieldComponent.SingleSelect,
      defaultValue: { label: t('15'), value: '15'},
      props: {
        options: [
          { label: '4', value: '4'},
          { label: '5', value: '5'},
          { label: '6', value: '6'},
          { label: '7', value: '7'},
          { label: '8', value: '8'},
          { label: '9', value: '9'},
          { label: '10', value: '10'},
          { label: '11', value: '11'},
          { label: '12', value: '12'},
          { label: '13', value: '13'},
          { label: '14', value: '14'},
          { label: '15', value: '15'},
        ]
      },
    },
    {
      key: 'size',
      label: t('size'),
      component: FieldComponent.SingleSelect,
      defaultValue: { label:'adaptive', value: 'adaptive'},
      props: {
        options: [
          { label: 'adaptive', value: 'adaptive' },
          { label: '1:1', value: '1:1' }, 
          { label: '16:9', value: '16:9' }, 
          { label: '9:16', value: '9:16' }, 
          { label: '4:3', value: '4:3' }, 
          { label: '3:4', value: '3:4' }, 
          { label: '21:9', value: '21:9' }, 
        ]
      },
    },
     {
      key: 'videoResolution',
      label: t('videoResolution'),
      component: FieldComponent.SingleSelect,
      defaultValue: { label:'480p', value: '480p'},
      props: {
        options: [
          { label: '480p', value: '480p' },
          { label: '720p', value: '720p' }, 
          { label: '1080p', value: '1080p' }
        ]
      },
    },
    
  ],
  // 定义捷径的返回结果类型
  resultType: {
    type: FieldType.Attachment
  },
  execute: async (formItemParams: { videoMethod: any, videoPrompt: string, refImage: any,seconds:any,size:any,videoResolution:any,refVideo:any,refAudio:any  }, context) => {
    const { videoMethod = '', videoPrompt = '', refImage = '',seconds='',size='',videoResolution='',refVideo='',refAudio='' } = formItemParams;


    /** 为方便查看日志，使用此方法替代console.log */
    const debugLog = (arg: any) => {
      // @ts-ignore
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        ...arg
      }));
    };
 // 创建错误响应的辅助函数
    const createErrorResponse = (name: string, videoUrl: string) => ({
      code: FieldCode.Success,
      data: [{
        name: `${name}.mp4`,
        content: videoUrl,
        contentType: 'attachment/url'
      }]
    });

    // 定义常量
    const API_BASE_URL = 'https://api.xunkecloud.cn/v1/videos';
    const POLLING_INTERVAL = 5000; // 5秒间隔
    const MAX_POLLING_TIME = 900000; // 900秒最大等待时间
     // 错误视频URL配置
    const ERROR_VIDEOS = {
      DEFAULT: 'https://pay.xunkecloud.cn/image/Wrong.mp4',
      OVERRUN: 'https://pay.xunkecloud.cn/image/Overrun.mp4',
      NO_CHANNEL: 'https://pay.xunkecloud.cn/image/unusual.mp4',
      INSUFFICIENT: 'https://pay.xunkecloud.cn/image/Insufficient.mp4',
      INVALID_TOKEN: 'https://pay.xunkecloud.cn/image/tokenError.mp4'
    };


    try {

      
      // 构建请求参数
      let modelName = `${videoMethod.value}-${videoResolution.value}`;
      
      const requestBody: any = {
        model: modelName,
        prompt: videoPrompt,
        metadata:{
          ratio: size.value,
          duration: Number(seconds.value),
          resolution: videoResolution.value,
        }
      };

      console.log(requestBody);
      

      // 收集附件URL的通用函数
      const collectAttachmentUrls = (attachments: any, maxCount: number): string[] => {
        const urls: string[] = [];
        if (attachments && Array.isArray(attachments)) {
          for (const subArray of attachments) {
            if (subArray && Array.isArray(subArray)) {
              for (const item of subArray) {
                if (item?.tmp_url) {
                  // 移除 tmp_url 中的空格和反引号
                  const cleanUrl = item.tmp_url.trim().replace(/^`|`$/g, '');
                  urls.push(cleanUrl);
                  // 达到最大数量时停止
                  if (urls.length >= maxCount) {
                    return urls;
                  }
                }
              }
            }
          }
        }
        return urls;
      };

      // 收集各种附件URL
      const imageUrls = collectAttachmentUrls(refImage, 9);
      const videoUrls = collectAttachmentUrls(refVideo, 3);
      const audioUrls = collectAttachmentUrls(refAudio, 3);

      // 添加到请求体
      if (imageUrls.length > 0) {
        requestBody.images = imageUrls;
      }
      if (videoUrls.length > 0) {
        requestBody.videos = videoUrls;
      }
      if (audioUrls.length > 0) {
        requestBody.audios = audioUrls;
      }

      
      // 收集所有参考图片的 tmp_url 到数组中
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      };
      console.log(requestOptions);
      

      // 创建视频任务
      const createTask = await context.fetch(API_BASE_URL, requestOptions, 'auth_id_1');
      const taskResp: any = await createTask.json();


      // 检查是否返回了任务id
      if (!taskResp?.id) {
        console.log(taskResp);
        if (taskResp?.error) {
          throw new Error(taskResp.error.message || '创建视频任务失败');
        }else{
          let msg = taskResp.message;
          try { msg = JSON.parse(msg).message; } catch {}
          msg = msg.replace(/\s*Request id:.*/i, '').trim();
          throw new Error(msg || '创建视频任务失败');
        }
        
        
      }

      // 轮询获取视频状态
      const videoDetailUrl = `${API_BASE_URL}/${taskResp.id}`;
      const detailRequestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      };

      const startTime = Date.now();
      let videoDetailResp: any;
      let pollingComplete = false;

      while (!pollingComplete && (Date.now() - startTime) < MAX_POLLING_TIME) {
        const getTaskDetail = await context.fetch(videoDetailUrl, detailRequestOptions, 'auth_id_1');
        videoDetailResp = await getTaskDetail.json();
        // 检查状态
        if (videoDetailResp?.status === 'failed') {
          debugLog({ message: '视频生成失败', errorType: '官方错误，提示词/图片违规' });
            return createErrorResponse('官方错误，提示词/图片违规', ERROR_VIDEOS.DEFAULT);
        } else if (videoDetailResp?.status === 'completed' || videoDetailResp?.status === 'succeeded') {
          pollingComplete = true;
          debugLog({ message: '视频生成完成' });
        } else {          
          // 未完成，等待后继续轮询
          await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
        }
      }

      // 检查是否超时
      if (!pollingComplete) {
        debugLog({ message: '视频生成超时', errorType: '轮询超时' });
          return {
            code: FieldCode.Error,
            data: createErrorResponse('捷径异常', ERROR_VIDEOS.OVERRUN).data
          };
      }

      // 从视频详情中提取视频URL
      const videoUrl = videoDetailResp?.video_url || '';
      console.log(videoUrl);
      
        
        return {
          code: FieldCode.Success,
          data: [{
            name: `${taskResp.id}.mp4`,
            content: videoUrl,
            contentType: 'attachment/url'
          }]
        };
      
    } catch (error: any) {
      const errorMessage = String(error);
      debugLog({ '异常错误': errorMessage });

      // 根据错误类型返回相应的错误视频
      if (errorMessage.includes('渠道')) {
        debugLog({ message: '无可用渠道', errorType: '渠道错误', errorMessage });
        return createErrorResponse('捷径异常', ERROR_VIDEOS.NO_CHANNEL);
      } else if (errorMessage.includes('额度')||errorMessage.includes('余额')||errorMessage.includes('quota')) {
        debugLog({ message: '令牌额度已用尽', errorType: '余额不足', errorMessage });
        return createErrorResponse('余额耗尽', ERROR_VIDEOS.INSUFFICIENT);
      } else if (errorMessage.includes('令牌')) {
        debugLog({ message: '无效的令牌', errorType: '令牌错误', errorMessage });
        return createErrorResponse('无效的令牌', ERROR_VIDEOS.INVALID_TOKEN);
      }

      // 未知错误
      return {
        code: FieldCode.Error
      };
    }
  }
});
export default basekit;