import * as React from "react";
import {
  ScrollableList,
  IListItemDetails,
  ListSelection,
  ListItem
} from "azure-devops-ui/List";
import "./quicklinks.scss"
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { showRootComponent } from "../../Common";
import * as SDK from "azure-devops-extension-sdk";
// import { Icon, IconSize } from "azure-devops-ui/Icon";
import { Card } from "azure-devops-ui/Card";
import { ITaskItem, MSStoryData } from "./Data";
import { QueryResult } from "./StoryData";
import { SearchBox } from "@fluentui/react/lib/SearchBox";
import { cleanupDefaultLayerHost } from "@fluentui/react";
// import { initializeIcons } from "@fluentui/react/lib";

// initializeIcons();

interface MyStates {
  StoryRecordsArray: Array<ITaskItem<{}>>;
  StoryRecordsProvider: ArrayItemProvider<ITaskItem>
  IsRenderReady: boolean;
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
      StoryRecordsProvider: new ArrayItemProvider([])
    };
  }

  public selection = new ListSelection(true);
  // public tasks = this.fetchAllJSONDataPlusState;
  // public tasks = new ArrayItemProvider(MSStoryData);

  public componentDidMount() {
    SDK.init().then(() => {
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

  //TEST FUNCTIONS START
  public async projectQueries() {
    const queries = (await QueryResult);
    return queries
  }

  //TEST FUNCTIONS END

  public async fetchAllJSONDataPlusState(){
    let storiesplaceholder = new Array<ITaskItem<{}>>();
    const Stories = (await QueryResult);
    for (let entry of Stories) {
      // let cleanAreaPath = entry.fields["System.AreaPath"].Split('\\')[1]
      storiesplaceholder.push({ "name": entry.fields["System.Title"], "description": entry.fields["System.AreaPath"], "id": entry.fields["System.Id"]})
      // storiesplaceholder.push({ "name": entry.fields["System.Title"], "description": entry.id.toString()})
    }
    let arrayItemProvider = new ArrayItemProvider(storiesplaceholder)
    for (let entry of storiesplaceholder) {
      let cleanAreaPath = entry.description.split("\\")[1]
      this.state.StoryRecordsArray.push({ "description": cleanAreaPath, "name": entry.name, "id": entry.id})
    }

    // return arrayItemProvider
    this.setState({
      StoryRecordsProvider: arrayItemProvider
      // StoryRecordsArray: storiesplaceholder
    });

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
                width="100%"
              />
            </div>
          </div>
        </Card>
      </div>
    );
    }       else {
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
            <span className="fontSizeMS font-size-ms text-ellipsis">
              {item.name}
            </span>
            <span className="fontSizeMS font-size-ms text-ellipsis secondary-text">
              {item.description}
            </span>
          </div>
        </div>
      </ListItem>
    );
  };
}

export default StoryLinkComponent;

showRootComponent(<StoryLinkComponent />);
