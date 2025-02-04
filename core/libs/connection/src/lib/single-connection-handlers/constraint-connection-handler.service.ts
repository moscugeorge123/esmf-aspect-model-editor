import {FiltersService} from '@ame/loader-filters';
import {DefaultConstraint, ModelElementNamingService, DefaultCharacteristic} from '@ame/meta-model';
import {MxGraphService, MxGraphHelper} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {SingleShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class ConstraintConnectionHandler implements SingleShapeConnector<DefaultConstraint> {
  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private filtersService: FiltersService
  ) {}

  public connect(constraint: DefaultConstraint, source: mxgraph.mxCell) {
    const defaultCharacteristic = DefaultCharacteristic.createInstance();
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(defaultCharacteristic);
    const child = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(metaModelElement, {parent: MxGraphHelper.getModelElement(source)})
    );
    constraint.update(defaultCharacteristic);
    this.mxGraphService.assignToParent(child, source);
    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}
