/** @format */

import store from "store";

const checkPermission = (name: string) => {
  return true;
  // const auth = store.getState().auth;

  // if (Array.isArray(auth?.permissions) && auth.permissions.length > 0) {
  //   return auth.permissions?.includes(name);
  // } else {
  // }
};

export default checkPermission;
