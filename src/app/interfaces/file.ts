export interface IUploadedFile {
  fieldname: string; // The name of the form field associated with the file
  originalname: string; // The original name of the uploaded file
  encoding: string; // The encoding type of the file
  mimetype: string; // The MIME type of the file
  destination: string; // The folder where the file is saved
  filename: string; // The name of the file within the destination folder
  path: string; // The full path to the uploaded file
  size: number; // The size of the file in bytes
}
