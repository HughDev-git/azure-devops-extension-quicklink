import { RestClientBase } from "azure-devops-extension-api/Common/RestClientBase";
import {
    IWorkItemFormService,
    QueryBatchGetRequest,
    WorkItemTrackingServiceIds,
  } from "azure-devops-extension-api/WorkItemTracking";
  import { WorkItemTrackingRestClient} from "azure-devops-extension-api/WorkItemTracking/WorkItemTrackingClient";
  import * as SDK from "azure-devops-extension-sdk";
import { ProjectInfo } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { IWorkItemTrackingApi } from "azure-devops-node-api/WorkItemTrackingApi";
// import { WorkItemFormNavigationService } from "TFS/WorkItemTracking/Services";

  // var client = new RestClientBase(options: IVss)

  let queries = finalmethodGetQueries();

  public 


  async function RetrieveCurrentProjectInfo(){
    const workItemFormService = await SDK.getService<ProjectInfo>(
      WorkItemTrackingServiceIds.WorkItemFormService
    )
      let projectName = (await workItemFormService.name)
      var a = projectName
      return projectName
  }

  async function RetrieveExtensionQueries(){
    let thisProject = await RetrieveCurrentProjectInfo()
    const restClient = await SDK.getService<WorkItemTrackingRestClient>(
     WorkItemTrackingServiceIds.WorkItemFormService
    )
      let queries = (await restClient.getQueries(thisProject ?? 'Master Template'))
      return queries
  }
  
  export const Queries =  queries
  // async function ExecuteCustomerStoryQuery(){
  //   const workItemFormService = await SDK.getService<WorkItemTrackingRestClient>(
  //     WorkItemTrackingServiceIds.WorkItemFormService
  //   )
  //     let outcomeT1Data = (await workItemFormService.g
  // }