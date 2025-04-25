
export enum ImageDisplayType {
    Portrait = "portrait",
    Cover = "cover",
    Wordmark = "wordmark",
    Attachment = "attachment"
}


export type ImageStub = {
    path: string,
    path_quick: string | null,
    display_type: ImageDisplayType | `${ImageDisplayType}`,
    blur_hash: string | null,
    storage: string
}
