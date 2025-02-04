import {FiltersService} from '@ame/loader-filters';
import {Operation, ModelElementNamingService, DefaultProperty} from '@ame/meta-model';
import {MxGraphService, ModelInfo, MxGraphHelper} from '@ame/mx-graph';
import {NotificationsService} from '@ame/shared';
import {Injectable} from '@angular/core';
import {SingleShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class OperationConnectionHandler implements SingleShapeConnector<Operation> {
  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private notificationsService: NotificationsService,
    private filtersService: FiltersService
  ) {}

  public connect(operation: Operation, source: mxgraph.mxCell, modelInfo: ModelInfo) {
    const defaultProperty = DefaultProperty.createInstance();

    const overWrittenProperty = {property: defaultProperty, keys: {}};
    if (ModelInfo.IS_OPERATION_OUTPUT === modelInfo) {
      if (operation.output) {
        this.notificationsService.warning({title: 'Operation output is already defined'});
        return;
      }
      operation.output = overWrittenProperty;
    } else if (ModelInfo.IS_OPERATION_INPUT === modelInfo) {
      operation.input.push(overWrittenProperty);
    }

    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(defaultProperty);
    const child = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(metaModelElement, {parent: MxGraphHelper.getModelElement(source)})
    );
    this.mxGraphService.assignToParent(child, source);
    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}
