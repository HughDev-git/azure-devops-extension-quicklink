import * as React from "react";
import {
  ScrollableList,
  IListItemDetails,
  ListSelection,
  ListItem
} from "azure-devops-ui/List";
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import * as SDK from "azure-devops-extension-sdk";
// import { Icon, IconSize } from "azure-devops-ui/Icon";
import { Card } from "azure-devops-ui/Card";
import { ITaskItem, MSStoryData } from "./Data";
import { SearchBox } from "@fluentui/react/lib/SearchBox";
import { initializeIcons } from "@fluentui/react/lib/";

// import "./List.Example.css";



interface MyStates {
  StoryRecords: ArrayItemProvider<ITaskItem>;
  IsRenderReady: boolean;
}

const commandBarItems: IHeaderCommandBarItem[] = [
  {
    id: "testCreate",
    text: "Add",
    onActivate: () => {
      alert("This would normally trigger a modal popup");
    },
    iconProps: {
      iconName: "Add"
    },
    isPrimary: true,
    tooltipProps: {
      text: "Add activity to the selected story"
    }
  }
];

export class StoryLinkComponent extends React.Component<{}, MyStates> {
  constructor(props: {}) {
    super(props);
    this.state = {
      // eventContent: "",
      // StoryRecords: new <ArrayItemProvider<ITaskItem<[]>();
      StoryRecords: null,
      IsRenderReady: false
    };
  }

  public componentDidMount() {
    // SDK.init().then(() => {
    initializeIcons();
    this.fetchAllStories().then(() => {
      this.filterStoriesByTeam();
    });
    // });
  }

  public selection = new ListSelection(true);
  public allStories = new ArrayItemProvider(MSStoryData);

  public filter = (e) => {
    const keyword = e.target.value;
    //   this.setState({
    //     StoryRecords: this.allStories
    //  });
    // alert(keyword)
    // this.allStories.filter((val) => val..toLowerCase().startsWith(keyword.toLowerCase());

    // if (keyword !== '') {
    //   const results = tasks.filter((record) => {
    //     return record.name.toLowerCase().startsWith(keyword.toLowerCase());
    //     // Use the toLowerCase() method to make it case-insensitive
    //   });
    //   setFoundRecords(results);
    // } else {
    //   setFoundRecords(USERS);
    //   // If the text field is empty, show all users
    // }

    // setName(keyword);
  };

  public async fetchAllStories() {
    // let dataplaceholderstoriesprovider = new ArrayItemProvider(null);
    let dataplaceholderstories = new Array<ITaskItem>();
    const stories = await MSStoryData;
    for (let entry of stories) {
      dataplaceholderstories.push({
        name: entry.name,
        description: entry.description
      });
    }
    let dataplaceholderstoriesprovider = new ArrayItemProvider(
      dataplaceholderstories
    );
    this.setState({
      StoryRecords: dataplaceholderstoriesprovider
    });
  }

  public async filterStoriesByTeam() {
    this.setState({
      IsRenderReady: true
    });
  }

  public render(): JSX.Element {
    if (this.state.IsRenderReady) {
      return (
        <div>
          <Card
            className="flex-grow bolt-table-card"
            titleProps={{ text: "Available Stories", ariaLevel: 9 }}
            headerCommandBarItems={commandBarItems}
          >
            <div className="flex-grow bolt-table-card">
              <SearchBox
                placeholder="Search"
                underlined={true}
                // onChange={this.filter}
              />
              <div style={{ display: "flex", height: "130px" }}>
                <ScrollableList
                  itemProvider={this.state.StoryRecords}
                  renderRow={this.renderRow}
                  selection={this.selection}
                  width="100%"
                />
              </div>
            </div>
          </Card>
        </div>
      );
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

// showRootComponent(<StoryLinkComponent />);
