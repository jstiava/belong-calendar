

export enum IamAccessLevel {
  Read = 1,
  ReadUpdate = 2,
  Request = 3,
  RequestReadUpdate = 4,
  CreateReadUpdate = 5,
  CreateReadUpdateDelete = 6
}

export enum CertAttributeValue {
  Allow = "allow",
  Deny = "deny",
  Request = "request"
}

export interface CertificateAttributes {
  content?: CertAttributeValue,
  timing?: CertAttributeValue,
  date?: CertAttributeValue,
  iam?: CertAttributeValue
}

export interface Certificate {
  uuid: string,
  name: string,
  last_updated_on: Date,

}