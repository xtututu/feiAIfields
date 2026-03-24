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
        // 'videoMethod': '模型选择',
        'videoPrompt': '视频提示词',
        'refImage': '参考图片',
        'firstFrame': '首帧图片',
        'tailFrame': '尾帧图片',
        // 'seconds': '视频时长',
        'size': '视频分辨率',
        'aspectRatio': '视频比例',
        // 'modelBrand':'迅客'

      },
      'en-US': {
        // 'videoMethod': 'Model selection',
        'videoPrompt': 'Video prompt',
        'refImage': 'Reference image',
        'firstFrame': 'First frame image',
        'tailFrame': 'Tail frame image',
        // 'seconds': 'Video duration',
        'size': 'Video size',
        'aspectRatio': 'Aspect ratio',
        // 'modelBrand':'Xunke'

      },
      'ja-JP': {
        // 'videoMethod': 'モデル選択',
        'videoPrompt': 'ビデオ提示词',
        'refImage': '参考画像',
        'firstFrame': '首フレーム画像',
        'tailFrame': '尾フレーム画像',
        // 'seconds': 'ビデオ再生時間',
        'size': 'ビデオサイズ',   
        'aspectRatio': 'アスペクト比',
        // 'modelBrand':'Xunke'

      },
    }
  },

  // authorizations: [
  //   {
  //     id: 'auth_id_1',
  //     platform: 'xunkecloud',
  //     type: AuthorizationType.HeaderBearerToken,
  //     required: true,
  //     instructionsUrl: "http://api.xunkecloud.cn/login",
  //     label: '关联账号',
  //     icon: {
  //       light: '',
  //       dark: ''
  //     }
  //   }
  // ],
  // 定义捷径的入参
  formItems: [ 
    
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
        supportType: [FieldType.Attachment],
      }
    },
    {
      key: 'firstFrame',
      label: t('firstFrame'),
      component: FieldComponent.FieldSelect,
      props: {
        supportType: [FieldType.Attachment],
      }
    },
    {
      key: 'tailFrame',
      label: t('tailFrame'),
      component: FieldComponent.FieldSelect,
      props: {
        supportType: [FieldType.Attachment],
      }
    },
    {
      key: 'size',
      label: t('size'),
      component: FieldComponent.SingleSelect,
      defaultValue: { label: '480p', value: '480p'},
      props: {
        options: [
           { label: '480p', value: '480p'},
          { label: '720p', value: '720p'},
          { label: '1080p', value: '1080p'},
        ]
      },
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
  ],
  // 定义捷径的返回结果类型
  resultType: {
    type: FieldType.Attachment
  },
  execute: async (formItemParams: { videoMethod: any, videoPrompt: string, refImage: any,seconds:any,size:any,aspectRatio:any,firstFrame:any,tailFrame:any }, context) => {
    const { videoPrompt = '', refImage = '',seconds,size,aspectRatio,firstFrame,tailFrame } = formItemParams;


     /** 为方便查看日志，使用此方法替代console.log */
    function debugLog(arg: any) {
      // @ts-ignore
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        ...arg
      }))
    }

    
    // 常量定义
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

    // 创建错误响应的辅助函数
    const createErrorResponse = (name: string, videoUrl: string) => ({
      code: FieldCode.Success,
      data: [{
        name: `${name}.mp4`,
        content: videoUrl,
        contentType: 'attachment/url'
      }]
    });

    try {


       if (!(context as any).hasQuota) {
        debugLog({'=0 无配额': { tableID: (context as any).tableID,baseOwnerID: (context as any).baseOwnerID }});
        return { code: FieldCode.QuotaExhausted };
      }
      // 构建请求体
      const requestBody: any = {
        model: 'sora-2',
        prompt: videoPrompt,
        seconds: 10,
        size: size.value,
        aspect_ratio: aspectRatio.value
      };

      // 如果refImage存在且有第一个元素的tmp_url，则添加input_reference参数
      if (refImage && Array.isArray(refImage) && refImage.length > 0 && refImage[0]?.tmp_url) {
        requestBody.input_reference = [refImage[0].tmp_url];
      }
      // 如果firstFrame存在且有第一个元素的tmp_url，则添加first_frame参数
      if (firstFrame && Array.isArray(firstFrame) && firstFrame.length > 0 && firstFrame[0]?.tmp_url) {
        requestBody.first_frame_image = firstFrame[0].tmp_url;
      }
      // 如果tailFrame存在且有第一个元素的tmp_url，则添加tail_frame参数
      if (tailFrame && Array.isArray(tailFrame) && tailFrame.length > 0 && tailFrame[0]?.tmp_url) {
        requestBody.first_frame_image = tailFrame[0].tmp_url;
      }


      const jsonRequestOptions = {
          method: 'POST',
          headers: {'Content-Type': 'application/json',"Authorization": "Bearer sk-wWggSTZYR1DVO14p23rVQf2zGMVwSqxuLgfL6l0MTFdyqL5s"},
          body: JSON.stringify(requestBody)
        };
        
        
      const  taskResp = await context.fetch(API_BASE_URL, jsonRequestOptions);
    
      console.log(taskResp);
      console.log("=============");
      
      
      debugLog({ taskId: taskResp.id, message: '视频生成任务已创建' });

      // 检查任务ID是否返回
      if (taskResp?.id) {
        // 轮询获取视频详情
        const videoDetailUrl = `${API_BASE_URL}/${taskResp.id}`;
        const detailRequestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        };

        const startTime = Date.now();
        let videoDetailResp: any;
        let isPollingComplete = false;

          debugLog("开始轮询任务");
        // 轮询逻辑
        while (!isPollingComplete && (Date.now() - startTime) < MAX_POLLING_TIME) {
          const getTaskDetail = await context.fetch(videoDetailUrl, detailRequestOptions, 'auth_id_1');
          videoDetailResp = await getTaskDetail.json();
          
          // 检查状态
          if (videoDetailResp?.status === 'failed') {
            debugLog({ message: '视频生成失败', errorType: '官方错误，提示词/图片违规' });
            return createErrorResponse('官方错误，提示词/图片违规', ERROR_VIDEOS.DEFAULT);
          } else if (videoDetailResp?.status === 'completed' || videoDetailResp?.status === 'succeeded') {
            isPollingComplete = true;
            debugLog({ message: '视频生成完成' });
          } else {
            // 未完成，等待后继续轮询
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
          }
        }

        console.log(videoDetailResp);
        

        // 检查是否超时
        if (!isPollingComplete) {
          debugLog({ message: '视频生成超时', errorType: '轮询超时' });
          return {
            code: FieldCode.Error,
            data: createErrorResponse('捷径异常', ERROR_VIDEOS.OVERRUN).data
          };
        }

        // 提取视频URL并返回成功响应
        const videoUrl = videoDetailResp?.video_url || '';
        console.log(videoUrl);
        
        return {
          code: FieldCode.Success,
          data: [{
            name: `${videoPrompt}.mp4`,
            content: videoUrl,
            contentType: 'attachment/url'
          }]
        };
      } else {
        throw new Error(taskResp?.error?.message || '任务创建失败，未返回任务ID');
      }
    } catch (error: any) {
      const errorMessage = String(error);
      debugLog({ '异常错误': errorMessage });

      // 根据错误类型返回相应的错误视频
      if (errorMessage.includes('无可用渠道')) {
        debugLog({ message: '无可用渠道', errorType: '渠道错误', errorMessage });
        return createErrorResponse('捷径异常', ERROR_VIDEOS.NO_CHANNEL);
      } else if (errorMessage.includes('令牌额度已用尽')) {
        debugLog({ message: '令牌额度已用尽', errorType: '余额不足', errorMessage });
        return createErrorResponse('余额耗尽', ERROR_VIDEOS.INSUFFICIENT);
      } else if (errorMessage.includes('无效的令牌')) {
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