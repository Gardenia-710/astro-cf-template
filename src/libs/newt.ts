import { createClient } from "newt-client-js";
import type { Content, Image } from "newt-client-js";

export interface Member extends Content {
  name: string;
  title: string;
  type: string;
  image: Image;
}

export interface Advisor extends Content {
  name: string;
  title: string;
  comment: string;
  image: Image;
}

export interface Activity extends Content {
  title: string;
  description: string;
  body: string;
  thumbnail: Image;
}

export const newtClient = createClient({
  spaceUid: import.meta.env.NEWT_SPACE_UID,
  token: import.meta.env.NEWT_CDN_API_TOKEN,
  apiType: "cdn",
});

export const previewClient = createClient({
  spaceUid: import.meta.env.NEWT_SPACE_UID,
  token: import.meta.env.NEWT_API_TOKEN,
  apiType: "api",
});

export const getActivityPreview = async (postId: string) => {
  return await previewClient.getContent<Activity>({
    appUid: import.meta.env.NEWT_APP_UID,
    modelUid: "activity",
    contentId: postId,
  });
};
