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
import {
  IWorkItemFormService,
  WorkItemTrackingServiceIds,
} from "azure-devops-extension-api/WorkItemTracking";



interface MyStates {
  StepRecordsItemProvider: ArrayItemProvider<IPipelineItem>;
  isCoachMarkVisible: boolean;
  percentComplete: any;
  totalSteps: number;
  completedSteps: number;
  nextStep: number;
  nextStepText: string;
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
      nextStep: 0,
      nextStepText: "",
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
            this.state.percentComplete.toFixed(1) * 100 +
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
    const workItemFormService = await SDK.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService
    )
    //alert(pipelineItems[e.index].step);
    //If it is the first step selected and not complete, mark complete
    let responses = (await UserResponeItems)
    let shouldUpdateFields = this.setMarks(e, responses);
    this.determineIfAwaitExternalProcess(e, responses);
    this.setRemainingADOFields(e, responses)
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
      //console.log(JSON.stringify(this.state.StepRecordsItemProvider))
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
    let stringifiedJSON = JSON.stringify(this.state.StepRecordsItemProvider);
    workItemFormService.setFieldValues({"Custom.MSQuickStepResponses": stringifiedJSON});
  }
  // public updatePercentComplete() {
  //   let percentCompleted = this.state.completedSteps / this.state.totalSteps;
  //   //console.log("Percent Complete:  " + percentCompleted);
  //   this.setState({
  //     percentComplete: percentCompleted
  //     // StoryRecordsArray: storiesplaceholder
  //   });
  // }
  public async setRemainingADOFields(e: ITableRow<Partial<IPipelineItem<{}>>>, responses: IPipelineItem<{}>[]){
    const workItemFormService = await SDK.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService)
      //if First
      if (e.index === 0) {
        if (responses[0].status === "success") {
          this.setState({
            nextStepText: responses[1].title,
            nextStep: responses[1].step
          });
        } else {
          this.setState({
            nextStepText: responses[0].title,
            nextStep: responses[0].step
          });
        }
      }
      workItemFormService.setFieldValues({"Custom.MSQuickStepPercentComplete": this.state.percentComplete,"Custom.MSQuickStepNextStepID":this.state.nextStep, "Custom.MSQuickStepNextStepText": this.state.nextStepText});
  }

  public async determineIfAwaitExternalProcess(e: ITableRow<Partial<IPipelineItem<{}>>>, responses: IPipelineItem<{}>[]){
      const workItemFormService = await SDK.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService)
    if (responses.length > e.index + 1) {
      if (responses[e.index + 1].type === "external" && responses[e.index].status === "success") {
        workItemFormService.setFieldValues({"Custom.MSQuickStepIsAwaitingExternalAction": true});
      } else {
        workItemFormService.setFieldValues({"Custom.MSQuickStepIsAwaitingExternalAction": false});
      }
  }
}
  public async setMarks(e: ITableRow<Partial<IPipelineItem<{}>>>, responses: IPipelineItem<{}>[]) {
    //SET MARKS NEW START
    //Determine if we can mark step as success
    if(responses[e.index].status !== "success") {
      //Can return as this item should not be marked as success since the previous item is not success
      if(e.index != 0 && responses[e.index - 1].status !== "success") {
      } 
      //Can mark as success since first item
      if(e.index === 0){
        responses[e.index].status = "success";
      }
      //Can mark as success since previous item is success
      if(e.index != 0 && responses[e.index - 1].status === "success")
      responses[e.index].status = "success";
      return true
      }
      if (responses[e.index].status === "success") {
          for (let entry of responses) {
          if (entry.step >= responses[e.index].step) {
            entry.status = "queued";
          }
          if (entry.step == responses[e.index].step && entry.type == "external") {
            entry.status = "running";
          }
          // if (entry.step == responses[e.index].step + 1) {
          //   entry.status = "running";
          // }
        }
      }
    //SET MARKS NEW END
    //Prep states
    let total = responses.length;
    let completed = responses.filter((a) => a.status === "success").length;
    let nextStep = e.index + 2;
    //Account for no next item
    if (responses.length < nextStep) {
      this.setState({
        nextStepText: "No Next Step",
      });
    } else {
      this.setState({
        nextStepText: responses[nextStep - 1].title,
      });
    }
    let percentComplete = completed / total;
    this.setState({
      nextStep: nextStep,
      totalSteps: total,
      completedSteps: completed,
      percentComplete: percentComplete
    });
    //Account for next item being external
    if (responses.length > e.index + 1) {
      if (
        responses[e.index + 1].type === "external" &&
        responses[e.index].status === "success"
      ) {
        responses[e.index + 1].status = "running";
        this.setState({
          isCoachMarkVisible: true
          // StoryRecordsArray: storiesplaceholder
        });
        setTimeout(this.onDismissCoach.bind(this), 20000);
      }
    }
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

