// Reference: blueprint:javascript_object_storage
import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";
import Portuguese from "@uppy/locales/lib/pt_BR";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
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
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: onGetUploadParameters,
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

  const handleOpenDashboard = () => {
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
