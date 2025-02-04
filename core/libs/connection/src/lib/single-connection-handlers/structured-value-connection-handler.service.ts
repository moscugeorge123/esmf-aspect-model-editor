import {NamespacesCacheService} from '@ame/cache';
import {FiltersService} from '@ame/loader-filters';
import {StructuredValue, ModelElementNamingService, DefaultProperty} from '@ame/meta-model';
import {MxGraphService, MxGraphHelper} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {SingleShapeConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class StructuredValueConnectionHandler implements SingleShapeConnector<StructuredValue> {
  get currentCachedFile() {
    return this.namespacesCacheService.currentCachedFile;
  }

  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private namespacesCacheService: NamespacesCacheService,
    private filtersService: FiltersService
  ) {}

  public connect(structuredValue: StructuredValue, source: mxgraph.mxCell) {
    const property = DefaultProperty.createInstance();
    structuredValue.elements.push({property, keys: {}});
    structuredValue.deconstructionRule = `${structuredValue.deconstructionRule}(regex)`;
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(property);
    const propertyCell = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(metaModelElement, {parent: MxGraphHelper.getModelElement(source)})
    );
    this.mxGraphService.graph.labelChanged(source, MxGraphHelper.createPropertiesLabel(source));
    this.mxGraphService.assignToParent(propertyCell, source);
    this.currentCachedFile.resolveElement(property);

    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}
