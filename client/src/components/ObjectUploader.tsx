// Reference: blueprint:javascript_object_storage
import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import AwsS3 from "@uppy/aws-s3";
import XHR from "@uppy/xhr-upload";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";
import Portuguese from "@uppy/locales/lib/pt_BR";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
    useLocal?: boolean;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760,
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [useLocalUpload, setUseLocalUpload] = useState(false);
  
  const [uppy] = useState(() => {
    const uppyInstance = new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        allowedFileTypes: ['image/*'],
      },
      autoProceed: false,
      locale: Portuguese,
    })
      .use(Dashboard, {
        inline: false,
        proudlyDisplayPoweredByUppy: false,
        showRemoveButtonAfterComplete: true,
      })
      .on("complete", (result) => {
        onComplete?.(result);
        const dashboardPlugin = uppyInstance.getPlugin('Dashboard') as any;
        dashboardPlugin?.closeModal();
      });
    
    return uppyInstance;
  });

  const handleOpenDashboard = async () => {
    // Check if we should use local upload
    try {
      const params = await onGetUploadParameters();
      
      // Remove existing upload plugins
      if (uppy.getPlugin('AwsS3')) {
        uppy.removePlugin(uppy.getPlugin('AwsS3')!);
      }
      if (uppy.getPlugin('XHRUpload')) {
        uppy.removePlugin(uppy.getPlugin('XHRUpload')!);
      }
      
      if (params.useLocal) {
        // Use local XHR upload
        setUseLocalUpload(true);
        uppy.use(XHR, {
          endpoint: params.url,
          method: 'POST',
          formData: true,
          fieldName: 'file',
        });
      } else {
        // Use S3-style upload
        setUseLocalUpload(false);
        uppy.use(AwsS3, {
          shouldUseMultipart: false,
          getUploadParameters: onGetUploadParameters,
        });
      }
    } catch (error) {
      console.error('Error checking upload method:', error);
    }
    
    const dashboardPlugin = uppy.getPlugin('Dashboard') as any;
    if (dashboardPlugin) {
      dashboardPlugin.openModal();
    }
  };

  return (
    <Button onClick={handleOpenDashboard} className={buttonClassName} data-testid="button-upload-photo">
      {children}
    </Button>
  );
}
