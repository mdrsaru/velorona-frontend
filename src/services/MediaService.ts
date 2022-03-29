import axios from "../utils/axios/mainAxios";


export const mediaServices = {
  uploadProfileImage
}

function uploadProfileImage(formData: any) {
  try {
    return axios.post(`/v1/media/upload`, formData, {
      headers: {
        'Content-Type': `multipart/form-data`,
      },
    }).then((res) => {return res;},
      (err) => {return err;},
    );
  } catch (error) {throw error;}
}
