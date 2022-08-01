import * as SDK from "azure-devops-extension-sdk";

let CurrentHost = RetrieveCurrentHostInfo();

async function RetrieveCurrentHostInfo(){
    const thisHost = await SDK.init().then( () => SDK.getHost())
    return thisHost
  }

  export const Host =  CurrentHost