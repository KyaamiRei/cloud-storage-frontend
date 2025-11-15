import React, { ReactElement, ReactEventHandler } from "react";
import { Button, notification, Space } from "antd";
import { NotificationType } from "@/api/dto/notification.dto";



export const useNotificationCustom = () => {
  

  return [contextHolder, openNotificationWithIcon];
};
