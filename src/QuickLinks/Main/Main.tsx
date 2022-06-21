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
import { cleanupDefaultLayerHost } from "@fluentui/react";
import { Observer } from "azure-devops-ui/Observer";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { IWorkItemFieldChangedArgs, IWorkItemFormService, WorkItemTrackingServiceIds } from "azure-devops-extension-api/WorkItemTracking";
// import { initializeIcons } from "@fluentui/react/lib";

// initializeIcons();

interface MyStates {
  StoryRecordsArray: Array<ITaskItem<{}>>;
  StoryRecordsProvider: ArrayItemProvider<ITaskItem>
  IsRenderReady: boolean;
  ShowAllStories: boolean;
  IsItemSelected: string;
  ItemSelectedID: number;
  ItemSelectedURL: string
  ItemSelectedTitle: string
  ItemSelectedAreaPathFull: string
  ItemSelectedAreaPathShort: string
  FormAreaPath: string
  eventContent: string;
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



export class StoryLinkComponent extends React.Component<{}, MyStates> {
  constructor(props: {}) {
    super(props);
    this.state = {
      StoryRecordsArray: [],
      IsRenderReady: false,
      StoryRecordsProvider: new ArrayItemProvider([]),
      ShowAllStories: false,
      IsItemSelected: "none",
      ItemSelectedID: 0,
      ItemSelectedTitle: "",
      ItemSelectedURL: "",
      ItemSelectedAreaPathFull: "",
      ItemSelectedAreaPathShort: "",
      FormAreaPath: "",
      eventContent: ""
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
      this.fetchAllJSONDataPlusState().then(() => {
      this.buildWidget();
      this.projectQueries();
        })
    });
  }

  public buildWidget() {
    this.setState({
      IsRenderReady: true
    });

  }

  private registerEvents() {
    SDK.register(SDK.getContributionId(), () => {
      return {
        // Called when the active work item is modified
        onFieldChanged: (args: IWorkItemFieldChangedArgs) => {
          let string = args.changedFields["System.AreaPath"] || ""
          //console.log(string)
          if (string != ""){
            alert("Area Path Changed!")
          }
          //const checkstringExistence = args.changedFields.some( (key: string) => key == "System.AreaPath")
          // args.changedFields
          // if (args.changedFields.key == "System.AreaPath"){
          //   alert("Area Path Changed!")
          // }
          this.setState({
            eventContent: "The field changed was - " + string
          });
        }
    }
  })
  }

  //TEST FUNCTIONS START
  public async projectQueries() {
    const queries = (await QueryResult);
    return queries
  }

  //TEST FUNCTIONS END

  public OnSelect =  async (event: React.SyntheticEvent<HTMLElement>, listRow: IListRow<ITaskItem<{}>>) => {
    this.selectedItemID.value = listRow.data.id
    this.selectedItemTitle.value = listRow.data.title
    this.selectedItemURL.value = listRow.data.url
    this.selectedItemAreaPathFull.value = listRow.data.areapathfull
    this.setState({
      IsItemSelected: "",
      ItemSelectedURL: listRow.data.url
      // StoryRecordsArray: storiesplaceholder
    });
    //alert("Item Selected");
   }

  public async fetchAllJSONDataPlusState(){
    const workItemFormService = await SDK.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService
    );
    let storiesplaceholder = new Array<ITaskItem<{}>>();
    const thisProject = (await Project);
    const thisHost = (await Host);
    const Stories = (await QueryResult);
    const urlBuilder = "https://dev.azure.com/"+thisHost.name+"/"+thisProject?.name+"/_workitems/edit/";
    console.log(urlBuilder);
    for (let entry of Stories) {
      let AreaPath = new String(entry.fields["System.AreaPath"])
      let cleanedAreaPath = AreaPath.split("\\")[1]
      storiesplaceholder.push({ "title": entry.fields["System.Title"], "areapathshort": cleanedAreaPath, "id": entry.fields["System.Id"], "url": urlBuilder+entry.id+"/", "areapathfull": entry.fields["System.AreaPath"]})
      // storiesplaceholder.push({ "name": entry.fields["System.Title"], "description": entry.id.toString()})
    }
    for (let entry of storiesplaceholder) {
      //let cleanAreaPath = entry.description.split("\\")[1]
      this.state.StoryRecordsArray.push({ "areapathshort": entry.areapathshort, "title": entry.title, "id": entry.id, "url": entry.url, "areapathfull": entry.areapathfull})
    }
    let areaPath = await (await workItemFormService.getFieldValue("System.AreaPath")).toString();
    console.log(areaPath)
    let arrayItemProvider = new ArrayItemProvider(storiesplaceholder.filter((val) => val.areapathfull == areaPath))
    // return arrayItemProvider
    this.setState({
      StoryRecordsProvider: arrayItemProvider
      // StoryRecordsArray: storiesplaceholder
    });

  }

  public viewItem(){
    console.log("URL: "+this.state.ItemSelectedURL)
    console.log("ID: "+this.state.ItemSelectedID)
    console.log("Title: "+this.state.ItemSelectedTitle)
    console.log("AreaPathFull: "+this.state.ItemSelectedAreaPathFull)
    console.log("AreaPathShort: "+this.state.ItemSelectedAreaPathShort)
    window.open(this.state.ItemSelectedURL, '_blank');
  }


  // public setStoryList(){
  //   this.setState = {
  //     StoryRecordsProvider: this.state.StoryRecordsArray,
  //   };
  // }

  // public async filter (e: any) {
  //   const keyword = e.target.value.toLowerCase();
  //   let storiesplaceholder = new Array<ITaskItem<{}>>();
  //   const Stories = (await MSStoryData);
  //   for (let entry of Stories) {
  //     storiesplaceholder.push({ "description": entry.description, "name": entry.name})
  //   }
  //   if (keyword !== "") {
  //     const results = storiesplaceholder.filter((val) => {
  //       return val.name.toLowerCase().match(keyword.toLowerCase());
  //       // Use the toLowerCase() method to make it case-insensitive
  //     });
  //     let arrayItemProvider = new ArrayItemProvider(storiesplaceholder)
  //     // var a = new ArrayItemProvider(results);
  //     this.setState({
  //       StoryRecordsProvider: arrayItemProvider
  //     });
  //   } else {
  //     // var b = new ArrayItemProvider(MSStoryData);
  //     // this.setState({
  //     //   StoryRecordsProvider: this.state.StoryRecordsProvider
  //     // });
  //     // If the text field is empty, show all users
  //   }
  // };

  public render(): JSX.Element {
    if (this.state.IsRenderReady){
    return (
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
              // onChange={this.filter}
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
        <div style={{ float: "left", marginTop: "10px" }}>
        <Checkbox
                //onChange={(event, checked) => (firstCheckbox.value = checked)}
                checked={this.state.ShowAllStories}
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
            onClick={() => alert("Primary button clicked!")}
        />
        </ButtonGroup>
        </div>
        <div className="sample-work-item-events">{this.state.eventContent}</div>
      </div>
    );
    }       
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
