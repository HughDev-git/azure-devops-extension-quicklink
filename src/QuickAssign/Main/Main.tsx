import * as React from "react";
import {
  ScrollableList,
  IListItemDetails,
  ListSelection,
  ListItem,
  IListRow
} from "azure-devops-ui/List";
import "./quicklinks.scss"
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { showRootComponent } from "../../Common";
import * as SDK from "azure-devops-extension-sdk";
// import { Icon, IconSize } from "azure-devops-ui/Icon";
import { Card } from "azure-devops-ui/Card";
import { Button } from "azure-devops-ui/Button";
import { ButtonGroup } from "azure-devops-ui/ButtonGroup";
import { Checkbox } from "azure-devops-ui/Checkbox";
import { ITaskItem, MSStoryData } from "./Data";
import { QueryResult } from "./StoryData";
import { Project} from "./CurrentProject";
import { Host} from "./CurrentHost";
import { SearchBox } from "@fluentui/react/lib/SearchBox";
import { Observer } from "azure-devops-ui/Observer";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import {WorkItemTrackingRestClient} from "azure-devops-extension-api/WorkItemTracking/WorkItemTrackingClient";
import { IWorkItemFieldChangedArgs, IWorkItemFormService, WorkItemTrackingServiceIds, WorkItemRelation } from "azure-devops-extension-api/WorkItemTracking";
import { Link, Stack, StackItem, MessageBar, MessageBarType, ChoiceGroup, IStackProps, MessageBarButton, Text, IChoiceGroupStyles, ThemeProvider, initializeIcons } from "@fluentui/react";
import { getClient } from "azure-devops-extension-api";

interface MyStates {
  StoryRecordsArray: Array<ITaskItem<{}>>;
  StoryRecordsProvider: ArrayItemProvider<ITaskItem>
  IsRenderReady: boolean;
  IsItemSelected: string;
  ItemSelectedID: number;
  ItemSelectedURL: string;
  ItemSelectedURLForLinking: string
  ItemSelectedTitle: string;
  ItemSelectedAreaPathFull: string;
  ItemSelectedAreaPathShort: string;
  FormAreaPath: string;
  showAllItemsCheckedState: boolean;
  FormHasParent: string;
  ParentItemTitle: string;
  AreaPathOnLoad: string;
}

// const commandBarItems: IHeaderCommandBarItem[] = [
//   {
//     id: "testCreate",
//     // text: "Add",
//     onActivate: () => {
//       alert("This would normally trigger a modal popup");
//     },
//     iconProps: {
//       iconName: "Add"
//     },
//     isPrimary: true,
//     tooltipProps: {
//       text: "Add activity to the selected story"
//     }
//   }
// ];


const showAllCheckbox = new ObservableValue<boolean>(false);

export class StoryLinkComponent extends React.Component<{}, MyStates> {
  constructor(props: {}) {
    super(props);
    this.state = {
      StoryRecordsArray: [],
      IsRenderReady: false,
      StoryRecordsProvider: new ArrayItemProvider([]),
      IsItemSelected: "none",
      ItemSelectedID: 0,
      ItemSelectedTitle: "",
      ItemSelectedURL: "",
      ItemSelectedURLForLinking: "",
      ItemSelectedAreaPathFull: "",
      ItemSelectedAreaPathShort: "",
      FormAreaPath: "",
      showAllItemsCheckedState: false,
      FormHasParent: "",
      ParentItemTitle: "",
      AreaPathOnLoad: ""
    };
  }

  public selection = new ListSelection(true);

  private selectedItemID = new ObservableValue<number>(0);
  private selectedItemTitle = new ObservableValue<string>("");
  private selectedItemURL = new ObservableValue<string>("");
  private selectedItemAreaPathFull = new ObservableValue<string>("");
  // public tasks = this.fetchAllJSONDataPlusState;
  // public tasks = new ArrayItemProvider(MSStoryData);

  public componentDidMount() {
    SDK.init().then(() => {
      this.registerEvents();
      initializeIcons();
      this.fetchAllJSONDataPlusState().then(() => {
      this.buildWidget()
      // this.forceUpdate();
      // this.projectQueries();
        })
    })
  }

  public buildWidget() {
    this.setState({
      IsRenderReady: true,
    });
  }

  private async registerEvents() {
    //console.log("RegisterEvents Fired")
    //We need to define contribtuion ID because for some reason SDK.getContributionID() doesn't always return the right ID. Additionally, we will make 2 registers because the contribution ID doesn't always update
    let contID1 = "jarhughe.quicklinks.quicklink-work-item-form-group"
    let contID2 = "quicklink-work-item-form-group"
    SDK.register(contID1, () => {
      return { 
        // Called when the active work item is modified
        onFieldChanged: (args: IWorkItemFieldChangedArgs) => {
          // console.log(`onFieldChanged - ${JSON.stringify(args)}`)
          let string = args.changedFields["System.AreaPath"] || "NOT AREA PATH"
          if (string != "NOT AREA PATH"){
            // alert("Area Path Changed!")
            this.setState({
              AreaPathOnLoad: string
            });
            this.filterLinks();
          } else {
            // console.log("Some other field was changed")
          }
          //const checkstringExistence = args.changedFields.some( (key: string) => key == "System.AreaPath")
          // args.changedFields
          // if (args.changedFields.key == "System.AreaPath"){
          //   alert("Area Path Changed!")
          // }
          // this.setState({
          //   eventContent: "The field changed was - " + string
          // });
        }
    }
    
  })
    SDK.register(contID2, () => {
      return { 
        // Called when the active work item is modified
        onFieldChanged: (args: IWorkItemFieldChangedArgs) => {
          // console.log(`onFieldChanged - ${JSON.stringify(args)}`)
          let string = args.changedFields["System.AreaPath"] || "NOT AREA PATH"
          if (string != "NOT AREA PATH"){
            // alert("Area Path Changed!")
            this.setState({
              AreaPathOnLoad: string
            });
            this.filterLinks();
          } else {
            // console.log("Some other field was changed")
          }
          //const checkstringExistence = args.changedFields.some( (key: string) => key == "System.AreaPath")
          // args.changedFields
          // if (args.changedFields.key == "System.AreaPath"){
          //   alert("Area Path Changed!")
          // }
          // this.setState({
          //   eventContent: "The field changed was - " + string
          // });
        }
    }
    
  })
  }

  // private registerEventP2(contID: string){
  //   SDK.register(SDK.getContributionId(), () => {
  //     return { 
  //       // Called when the active work item is modified
  //       onFieldChanged: (args: IWorkItemFieldChangedArgs) => {
  //         let string = args.changedFields["System.AreaPath"] || "NOT AREA PATH"
  //         console.log(string)
  //         if (string != "NOT AREA PATH"){
  //           // alert("Area Path Changed!")
  //           // console.log("Area Path was changed")
  //           // this.filterLinks()
  //           this.setState({
  //             AreaPathOnLoad: string
  //           });
  //         } else {
  //           console.log("Some other field was changed")
  //         }
  //         //const checkstringExistence = args.changedFields.some( (key: string) => key == "System.AreaPath")
  //         // args.changedFields
  //         // if (args.changedFields.key == "System.AreaPath"){
  //         //   alert("Area Path Changed!")
  //         // }
  //         // this.setState({
  //         //   eventContent: "The field changed was - " + string
  //         // });
  //       }
  //   }
  // })
  // }

  //TEST FUNCTIONS START
  // public async projectQueries() {
  //   const queries = (await QueryResult);
  //   return queries
  // }
  //TEST FUNCTIONS END

  public async filterLinks() {
    const workItemFormService = await SDK.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService
    );
    let areaPath = this.state.AreaPathOnLoad;
    let arrayItemProvider = new ArrayItemProvider(this.state.StoryRecordsArray.filter((val) => val.areapathfull == areaPath)) 
    this.setState({
      StoryRecordsProvider: arrayItemProvider
      // StoryRecordsArray: storiesplaceholder
    });
  }

  public OnSelect =  async (event: React.SyntheticEvent<HTMLElement>, listRow: IListRow<ITaskItem<{}>>) => {
    this.selectedItemID.value = listRow.data.id
    this.selectedItemTitle.value = listRow.data.title
    this.selectedItemURL.value = listRow.data.url
    this.selectedItemAreaPathFull.value = listRow.data.areapathfull
    this.setState({
      IsItemSelected: "",
      ItemSelectedURL: listRow.data.url,
      ItemSelectedURLForLinking: listRow.data.urlforlinking
      // StoryRecordsArray: storiesplaceholder
    });
    //console.log(this.state.ItemSelectedURLForLinking);
    //alert("Item Selected");
   }

  public async fetchAllJSONDataPlusState(){
    const workItemFormService = await SDK.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService
    );
    //Determine if Parent exists first
    const client = getClient(WorkItemTrackingRestClient);
    let relations = await workItemFormService.getWorkItemRelations();
    for (let item of relations){
      //console.log("Attributes: "+item.attributes+" ||| Link Type: "+item.rel+" ||| URL: "+item.url)
      if(item.rel == "System.LinkTypes.Hierarchy-Reverse"){
        //Get the id from end of string
        var matches : number;
        matches = parseInt(item.url.match(/\d+$/)?.toString()||"")
        console.log(matches);
        let workitem = client.getWorkItem(matches)
        let title = (await workitem).fields["System.Title"]
        this.setState({
          FormHasParent: "1",
          ParentItemTitle: title
        });
      } else {
        this.setState({
          FormHasParent: "0"
        });
      }
      // console.log("Attributes: "+b.attributes+" ||| Link Type: "+b.rel+" ||| URL: "+b.url)
    }
    if (!relations.length){
      this.setState({
        FormHasParent: "0"
      });
    }
    let storiesplaceholder = new Array<ITaskItem<{}>>();
    const thisProject = (await Project);
    const thisHost = (await Host);
    const Stories = (await QueryResult);
    const urlBuilder = "https://dev.azure.com/"+thisHost.name+"/"+thisProject?.name+"/_workitems/edit/";
    //console.log(urlBuilder);
    for (let entry of Stories) {
      let AreaPath = new String(entry.fields["System.AreaPath"])
      let cleanedAreaPath = AreaPath.split("\\")[1]
      storiesplaceholder.push({ "title": entry.fields["System.Title"], "areapathshort": cleanedAreaPath, "id": entry.fields["System.Id"], "url": urlBuilder+entry.id+"/", "urlforlinking": entry.url, "areapathfull": entry.fields["System.AreaPath"]})
      // storiesplaceholder.push({ "name": entry.fields["System.Title"], "description": entry.id.toString()})
    }
    for (let entry of storiesplaceholder) {
      //let cleanAreaPath = entry.description.split("\\")[1]
      this.state.StoryRecordsArray.push({ "areapathshort": entry.areapathshort, "title": entry.title, "id": entry.id, "url": entry.url, "urlforlinking": entry.urlforlinking, "areapathfull": entry.areapathfull})
    }
    let areaPath = (await workItemFormService.getFieldValue("System.AreaPath")).toString();
    //console.log(areaPath)
    let arrayItemProvider = new ArrayItemProvider(storiesplaceholder.filter((val) => val.areapathfull == areaPath))
    // return arrayItemProvider
    this.setState({
      StoryRecordsProvider: arrayItemProvider
      // StoryRecordsArray: storiesplaceholder
    });

  }

  public viewItem(){
    // console.log("URL: "+this.state.ItemSelectedURL)
    // console.log("ID: "+this.state.ItemSelectedID)
    // console.log("Title: "+this.state.ItemSelectedTitle)
    // console.log("AreaPathFull: "+this.state.ItemSelectedAreaPathFull)
    // console.log("AreaPathShort: "+this.state.ItemSelectedAreaPathShort)
    window.open(this.state.ItemSelectedURL, '_blank');
  }

  public async addLink(){
    this.setState({
      FormHasParent: "1",
      ParentItemTitle: this.selectedItemTitle.value
      // StoryRecordsArray: storiesplaceholder
    });
    const workItemFormService = await SDK.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService
    );
    const linkInterfaceItem : WorkItemRelation[] =
    [
      {
      rel: "Parent",
      url: this.state.ItemSelectedURLForLinking,
      attributes: [""]
      }
    ]
      workItemFormService.addWorkItemRelations(linkInterfaceItem)
    // this.forceUpdate();
  }

  public async removeLink(){
    console.log(this.state.ItemSelectedURLForLinking);
    this.setState({
      FormHasParent: "0"
      // StoryRecordsArray: storiesplaceholder
    });
    const workItemFormService = await SDK.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService
    );
    let a = await workItemFormService.getWorkItemRelations();
    for (let b of a){
      if(b.rel == "System.LinkTypes.Hierarchy-Reverse"){
        const removelinkInterfaceItem : WorkItemRelation[] =
        [
          {
          rel: b.rel,
          url: b.url,
          attributes: b.attributes
          }
        ]
        workItemFormService.removeWorkItemRelations(removelinkInterfaceItem)
      }
    }

      
    // this.forceUpdate();
  }


  // public setStoryList(){
  //   this.setState = {
  //     StoryRecordsProvider: this.state.StoryRecordsArray,
  //   };
  // }

  public async filter (e: any) {
    const keyword = e.target.value.toLowerCase();
    const workItemFormService = await SDK.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService
    );
    let areaPath = await (await workItemFormService.getFieldValue("System.AreaPath")).toString();
    //if we are not showing all items
    if (!this.state.showAllItemsCheckedState){
      if (keyword !== "") {
        let arrayItemProvider = new ArrayItemProvider(this.state.StoryRecordsArray.filter((val) => val.title.toLowerCase().match(keyword) && val.areapathfull == areaPath)) 
        this.setState({
          StoryRecordsProvider: arrayItemProvider
          // StoryRecordsArray: storiesplaceholder
        });
      } else {
        let arrayItemProvider = new ArrayItemProvider(this.state.StoryRecordsArray.filter((val) => val.areapathfull == areaPath))
        this.setState({
          StoryRecordsProvider: arrayItemProvider
          // StoryRecordsArray: storiesplaceholder
        });
      }
    } else {
    //if we are showing all items
      if (keyword !== "") {
        let arrayItemProvider = new ArrayItemProvider(this.state.StoryRecordsArray.filter((val) => val.title.toLowerCase().match(keyword))) 
        this.setState({
          StoryRecordsProvider: arrayItemProvider
          // StoryRecordsArray: storiesplaceholder
        });
      } else {
        let arrayItemProvider = new ArrayItemProvider(this.state.StoryRecordsArray) 
        this.setState({
          StoryRecordsProvider: arrayItemProvider
          // StoryRecordsArray: storiesplaceholder
        });
      }
    }
  };

  public async checkedClick(checked: boolean){
    showAllCheckbox.value = checked
    this.setState({
      showAllItemsCheckedState: checked
      // StoryRecordsArray: storiesplaceholder
    });
    if(checked){
      let arrayItemProvider = new ArrayItemProvider(this.state.StoryRecordsArray) 
      this.setState({
        StoryRecordsProvider: arrayItemProvider
        // StoryRecordsArray: storiesplaceholder
      });
    } else {
      const workItemFormService = await SDK.getService<IWorkItemFormService>(
        WorkItemTrackingServiceIds.WorkItemFormService
      );
      let areaPath = (await workItemFormService.getFieldValue("System.AreaPath")).toString();
      let arrayItemProvider = new ArrayItemProvider(this.state.StoryRecordsArray.filter((val) => val.areapathfull == areaPath)) 
      this.setState({
        StoryRecordsProvider: arrayItemProvider
        // StoryRecordsArray: storiesplaceholder
      });
    }
  }

  public render(): JSX.Element {
    if (this.state.IsRenderReady){
    return (
      <div>
        {this.state.FormHasParent == "0" ?
        <div>
        <Card
          className="flex-grow bolt-table-card"
          // titleProps={{ text: "Available Stories", ariaLevel: 9 }}
          // headerCommandBarItems={commandBarItems}
        >
          <div className="flex-grow bolt-table-card">
            <SearchBox
              placeholder="Search"
              underlined={true}
              onChange={this.filter.bind(this)}
            />
            <div style={{ display: "flex", height: "150px" }}>
              <ScrollableList
                itemProvider={this.state.StoryRecordsProvider}
                renderRow={this.renderRow}
                selection={this.selection}
                onSelect={this.OnSelect.bind(this)}
                width="100%"
              />
              <Observer selectedItem={this.selectedItemTitle}>
                {(props: { selectedItem: string}) => {
                  return null;
               }}
            </Observer>
            </div>
          </div>
          
        </Card>
        <div style={{ float: "left", marginTop: "10px", marginBottom: "20px" }}>
        <Checkbox
                onChange={(event, checked) => (this.checkedClick(checked))}
                checked={showAllCheckbox}
                label="Show All Items"
            />
        </div>
        <div style={{ float: "right", marginTop: "10px", display: this.state.IsItemSelected }}>
        <ButtonGroup>
        <Button
            ariaLabel="View this story"
            iconProps={{ iconName: "View" }}
            onClick={this.viewItem.bind(this)}
        />
        <Button
            ariaLabel="Link my actvity"
            primary={true}
            iconProps={{ iconName: "Add" }}
            onClick={this.addLink.bind(this)}
        />
        </ButtonGroup>
        </div>
        <MessageBar
            messageBarType={MessageBarType.warning}
            isMultiline={true}
            dismissButtonAriaLabel="Close"
            >
            Linking is important for reporting purposes! Please ensure you link this work item to one of the selections above.
            </MessageBar>
        </div>
        :
        
            <MessageBar
            messageBarType={MessageBarType.success}
            isMultiline={true}
            dismissButtonAriaLabel="Close"
            actions={
              <div>
                <MessageBarButton
                  onClick={this.removeLink.bind(this)}
                >
                Remove This Link
                </MessageBarButton>
              </div>
            }
            >
            Good to go! This work item is linked to {this.state.ParentItemTitle}.
            </MessageBar>
        
    }
    
      </div>);} 
    else {
      return (<div className="flex-row"></div>)

    }
    
  }


  private renderRow = (
    index: number,
    item: ITaskItem,
    details: IListItemDetails<ITaskItem>,
    key?: string
  ): JSX.Element => {
    return (
      <ListItem
        key={key || "list-item" + index}
        index={index}
        details={details}
      >
        <div className="list-example-row flex-row h-scroll-hidden">
          <div
            style={{ padding: "5px 0px" }}
            className="flex-column h-scroll-hidden"
          >
            <span className="fontSizeMS font-size-ms text-ellipsis" style={{ paddingLeft: "5px" }}>
              {item.title}
            </span>
            <span className="fontSizeMS font-size-ms text-ellipsis secondary-text" style={{ paddingLeft: "5px" }}>
              {item.areapathshort}
            </span>
          </div>
        </div>
      </ListItem>
    );
  };
}

export default StoryLinkComponent;

showRootComponent(<StoryLinkComponent />);

