import * as React from "react";
import {
  getStatusIndicatorData,
  IPipelineItem,
  UserResponeItems
} from "./UserResponses";

import { Card } from "azure-devops-ui/Card";
import { Status, StatusSize } from "azure-devops-ui/Status";
import {
  ITableColumn,
  SimpleTableCell,
  Table,
  ColumnSorting,
  SortOrder,
  sortItems,
  ITableRow
} from "azure-devops-ui/Table";
import {
  ProgressIndicator
} from "@fluentui/react";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { MessageCard, MessageCardSeverity } from "azure-devops-ui/MessageCard";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { showRootComponent } from "../../Common";
import * as SDK from "azure-devops-extension-sdk";


interface MyStates {
  StepRecordsItemProvider: ArrayItemProvider<IPipelineItem>;
  isCoachMarkVisible: boolean;
  percentComplete: number;
  totalSteps: number;
  completedSteps: number;
  isRenderReady: boolean;
}

export class QuickSteps extends React.Component<{}, MyStates> {
  constructor(props: {}) {
    super(props);
    this.state = {
      StepRecordsItemProvider: new ArrayItemProvider([]),
      isCoachMarkVisible: false,
      totalSteps: 0,
      completedSteps: 0,
      percentComplete: 0,
      isRenderReady: false
    };
  }

  public componentDidMount() {
    SDK.init().then(() => {
    this.fetchAllJSONData().then(() => {
      this.isRenderReady();
      })
    })
  }

  public isRenderReady(){
    this.setState({
      isRenderReady: true
      // StoryRecordsArray: storiesplaceholder
    });
  }
  public render(): JSX.Element {
    if (this.state.isRenderReady){
    return (
      <div>
        <ProgressIndicator
          label={
            "My Progress | " +
            parseInt(this.state.percentComplete.toFixed(1)) * 100 +
            " %"
          }
          // description={this.state.percentComplete + " %"}
          percentComplete={this.state.percentComplete}
        />
        <Card
          className="flex-grow bolt-table-card"
          contentProps={{ contentPadding: false }}
          titleProps={{ text: "Getting Started" }}
        >
          {/* <Observer itemProvider={this.itemProvider}>
          {(observableProps: {
            itemProvider: ArrayItemProvider<IPipelineItem>;
          }) => ( */}
          <Table<IPipelineItem>
            ariaLabel="Advanced table"
            //behaviors={[this.sortingBehavior]}
            className="table-example"
            columns={this.columns}
            containerClassName="h-scroll-auto"
            itemProvider={this.state.StepRecordsItemProvider}
            showLines={true}
            //singleClickActivation={true}
            onSelect={(event, data) => this.updateStatus(data)}
            // onActivate={(event, row) =>
          />
        </Card>
        <div style={{ marginTop: "10px" }}>
          {this.state.isCoachMarkVisible ? (
            <MessageCard
              //className="flex-self-stretch"
              onDismiss={this.onDismissCoach.bind(this)}
              severity={MessageCardSeverity.Info}
            >
              It looks like this next step needs to be completed by someone
              else. Once you receive confirmation it has been completed, come
              back here and go ahead and mark it as complete.
            </MessageCard>
          ) : (
            ""
          )}
        </div>
      </div> 
    );} else {
      return (<div className="flex-row"></div>)
    }
  }
  public onDismissCoach() {
    this.setState({
      isCoachMarkVisible: false
      // StoryRecordsArray: storiesplaceholder
    });
  }
  public async updateStatus(e: ITableRow<Partial<IPipelineItem>>) {
    //alert(pipelineItems[e.index].step);
    //If it is the first step selected and not complete, mark complete
    let responses = (await UserResponeItems)
    this.setMarks(e, responses);
    // console.log(UserResponeItems.length);
    let stepsplaceholder = new Array<IPipelineItem<{}>>();
    for (let entry of responses) {
      // let AreaPath = new String(entry.fields["System.AreaPath"])
      // let cleanedAreaPath = AreaPath.split("\\")[1]
      stepsplaceholder.push({
        step: entry.step,
        title: entry.title,
        status: entry.status,
        type: entry.type
      });
      // let total = stepsplaceholder.length;
      // let completed = stepsplaceholder.filter((a) => a.status === "success")
      // .length;
      // console.log("Total: " + total + "Completed: " + completed);
      let arrayItemProvider = new ArrayItemProvider(stepsplaceholder);
      this.setState({
        StepRecordsItemProvider: arrayItemProvider
        // StoryRecordsArray: storiesplaceholder
      });
      // alert(e.index);
    }
  }
  public updatePercentComplete() {
    let percentCompleted = this.state.completedSteps / this.state.totalSteps;
    console.log("Percent Complete:  " + percentCompleted);
    this.setState({
      percentComplete: percentCompleted
      // StoryRecordsArray: storiesplaceholder
    });
  }
  public setMarks(e: ITableRow<Partial<IPipelineItem<{}>>>, responses: IPipelineItem<{}>[]) {
    if (responses[e.index].status !== "success") {
      //determine if frst
      if (e.index === 0) {
        responses[e.index].status = "success";
      }
      if (e.index !== 0 && responses[e.index - 1].status === "success") {
        responses[e.index].status = "success";
      }
    } else {
      for (let entry of responses) {
        if (entry.step >= responses[e.index].step) {
          entry.status = "queued";
        }
      }
    }
    let total = responses.length;
    let completed = responses.filter((a) => a.status === "success")
      .length;
    this.setState({
      totalSteps: total,
      completedSteps: completed,
      percentComplete: completed / total
    });
    console.log("Total Steps:  " + total);
    console.log("Completed Steps:  " + completed);
    // for (let entry of pipelineItems) {
    //   if (entry.step >= pipelineItems[e.index].step) {
    //     if (
    //       entry.type === "external" &&
    //       pipelineItems[e.index - 1].status === "success"
    //     ) {
    //       entry.status = "running";
    //     } else {
    //       entry.status = "queued";
    //     }
    //     // entry.status = "queued";
    //   }
    // }
    //do a check to see if this is the last item in array
    if (responses.length > e.index + 1) {
      if (
        responses[e.index + 1].type === "external" &&
        responses[e.index].status === "success"
      ) {
        // alert("set running");
        responses[e.index + 1].status = "running";
        this.setState({
          isCoachMarkVisible: true
          // StoryRecordsArray: storiesplaceholder
        });
        setTimeout(this.onDismissCoach.bind(this), 20000);
      }
    }
    // do a check if we ever click an item that is external
    // if (
    //   pipelineItems[e.index].type === "external" &&
    //   pipelineItems[e.index].status === "success"
    // ) {
    //   pipelineItems[e.index].status = "running";
    // }
  }

  public async fetchAllJSONData() {
     let stepsplaceholder = new Array<IPipelineItem<{}>>();
    const responses = (await UserResponeItems);
    // const schema = (await ADOSchema)
    // var parseRespones = JSON.parse(responses)
    for (let entry of responses) {
      // let AreaPath = new String(entry.fields["System.AreaPath"])
      // let cleanedAreaPath = AreaPath.split("\\")[1]
      stepsplaceholder.push({
        step: entry.step,
        title: entry.title,
        status: entry.status,
        type: entry.type
      });
      // storiesplaceholder.push({ "name": entry.fields["System.Title"], "description": entry.id.toString()})
      let arrayItemProvider = new ArrayItemProvider(stepsplaceholder);
      this.setState({
        StepRecordsItemProvider: arrayItemProvider
        // StoryRecordsArray: storiesplaceholder
      });
    }
    // console.log("123");
  }
  private columns: ITableColumn<IPipelineItem> []= [
    {
      id: "title",
      name: "Action",
      renderCell: renderNameColumn,
      readonly: true,
      // sortProps: {
      //     ariaLabelAscending: "Sorted A to Z",
      //     ariaLabelDescending: "Sorted Z to A",
      // },
      width: 600
    },
    // {
    //     className: "pipelines-two-line-cell",
    //     id: "actions",
    //     name: "Actions",
    //     renderCell: renderLastRunColumn,
    //     width: -33,
    // },
    // {
    //     id: "time",
    //     ariaLabel: "Time and duration",
    //     readonly: true,
    //     renderCell: renderNameColumn,
    //     width: -33,
    // },
    // new ColumnMore(() => {
    //     return {
    //         id: "sub-menu",
    //         items: [
    //             { id: "submenu-one", text: "SubMenuItem 1" },
    //             { id: "submenu-two", text: "SubMenuItem 2" },
    //         ],
    //     };
    // }),
  ];

  // private itemProvider = new ObservableValue<ArrayItemProvider<IPipelineItem>>(
  //   // let a = (await UserResponeItems)
  //   new ArrayItemProvider(UserResponeItems)
  // );

  // private sortingBehavior = new ColumnSorting<Partial<IPipelineItem>>(
  //   (columnIndex: number, proposedSortOrder: SortOrder) => {
  //     this.itemProvider.value = new ArrayItemProvider(
  //       sortItems(
  //         columnIndex,
  //         proposedSortOrder,
  //         this.sortFunctions,
  //         this.columns,
  //         UserResponeItems
  //       )
  //     );
  //   }
  // );

//   private sortFunctions = [
//     // Sort on Name column
//     (item1: IPipelineItem, item2: IPipelineItem) => {
//       return item1.title.localeCompare(item2.title!);
//     }
//   ];
// }
}
function renderNameColumn(
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<IPipelineItem>,
  tableItem: IPipelineItem
): JSX.Element {
  return (
    <SimpleTableCell
      columnIndex={columnIndex}
      tableColumn={tableColumn}
      key={"col-" + columnIndex}
      contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m scroll-hidden"
    >
      <Status
        {...getStatusIndicatorData(tableItem.status).statusProps}
        className="icon-large-margin"
        size={StatusSize.l}
      />
      <div className="flex-row scroll-hidden">
        <Tooltip overflowOnly={true}>
          <span className="text-ellipsis">{tableItem.title}</span>
        </Tooltip>
      </div>
    </SimpleTableCell>
  );
  
}

export default QuickSteps;

showRootComponent(<QuickSteps/>);

