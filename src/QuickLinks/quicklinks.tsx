import * as React from "react";
import {
  ScrollableList,
  IListItemDetails,
  ListSelection,
  ListItem
} from "azure-devops-ui/List";
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { showRootComponent } from "../Common";
import * as SDK from "azure-devops-extension-sdk";
// import { Icon, IconSize } from "azure-devops-ui/Icon";
import { Card } from "azure-devops-ui/Card";
import { ITaskItem, MSStoryData } from "./Data";
import { SearchBox } from "@fluentui/react/lib/SearchBox";
import { initializeIcons } from "@fluentui/react/lib/";

initializeIcons();

interface MyStates {
  StoryRecords: ArrayItemProvider<ITaskItem>;
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
      StoryRecords: new ArrayItemProvider(MSStoryData)
    };
  }

  public selection = new ListSelection(true);
  public tasks = new ArrayItemProvider(MSStoryData);

  public filter = (e) => {
    const keyword = e.target.value.toLowerCase();
    if (keyword !== "") {
      const results = MSStoryData.filter((val) => {
        return val.name.toLowerCase().match(keyword.toLowerCase());
        // Use the toLowerCase() method to make it case-insensitive
      });
      var a = new ArrayItemProvider(results);
      this.setState({
        StoryRecords: a
      });
    } else {
      var b = new ArrayItemProvider(MSStoryData);
      this.setState({
        StoryRecords: b
      });
      // If the text field is empty, show all users
    }
  };

  public render(): JSX.Element {
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
              onChange={this.filter}
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
