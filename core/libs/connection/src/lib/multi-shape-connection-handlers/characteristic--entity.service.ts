import {NamespacesCacheService} from '@ame/cache';
import {
  DefaultCharacteristic,
  DefaultEntity,
  DefaultEnumeration,
  DefaultProperty,
  DefaultUnit,
  DefaultEntityValue,
  DefaultStructuredValue,
} from '@ame/meta-model';
import {MxGraphService, MxGraphAttributeService, MxGraphShapeOverlayService, MxGraphHelper} from '@ame/mx-graph';
import {LanguageSettingsService} from '@ame/settings-dialog';
import {Injectable} from '@angular/core';
import {MultiShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';
import {NotificationsService} from '@ame/shared';

@Injectable({
  providedIn: 'root',
})
export class CharacteristicEntityConnectionHandler implements MultiShapeConnector<DefaultCharacteristic, DefaultEntity> {
  get currentCachedFile() {
    return this.namespacesCacheService.currentCachedFile;
  }

  constructor(
    private mxGraphService: MxGraphService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private languageSettingsService: LanguageSettingsService,
    private namespacesCacheService: NamespacesCacheService,
    private notificationsService: NotificationsService
  ) {}

  connect(parentMetaModel: DefaultCharacteristic, childMetaModel: DefaultEntity, parent: mxgraph.mxCell, child: mxgraph.mxCell): void {
    if (parentMetaModel instanceof DefaultStructuredValue) {
      return this.notificationsService.warning({
        title: 'Unable to connect elements',
        message: 'StructuredValue can only contain a scalar "string-like value space" value',
        timeout: 5000,
      });
    }

    parentMetaModel.dataType = childMetaModel;
    this.mxGraphAttributeService.graph.getOutgoingEdges(parent).forEach(outEdge => this.removeCells(outEdge, null));
    this.mxGraphShapeOverlayService.removeOverlay(parent, MxGraphHelper.getNewShapeOverlayButton(parent));

    // Add icon when you simply connect an enumeration with an entity.
    if (parentMetaModel instanceof DefaultEnumeration) {
      // TODO: User should be informed if he wants to change the entity, otherwise, all the values will be deleted.
      if (!parentMetaModel.createdFromEditor) {
        parentMetaModel.values = [];
      }
      this.mxGraphShapeOverlayService.removeOverlay(parent, MxGraphHelper.getRightOverlayButton(parent));
      this.mxGraphShapeOverlayService.addComplexEnumerationShapeOverlay(parent);
      this.mxGraphShapeOverlayService.addBottomShapeOverlay(parent);
    }

    if (parentMetaModel.dataType) {
      MxGraphHelper.updateLabel(parent, this.mxGraphAttributeService.graph, this.languageSettingsService);
    }

    if (parentMetaModel.dataType?.isComplex()) {
      this.updateChildPropertiesLabels(parent);
    }

    this.mxGraphService.assignToParent(child, parent);
    this.mxGraphService.formatShapes();
  }

  private updateChildPropertiesLabels(parent: mxgraph.mxCell): void {
    const parentIncomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(parent);
    parentIncomingEdges.forEach(edge => {
      const edgeSourceMetaModelElement = MxGraphHelper.getModelElement(edge.source);
      if (edgeSourceMetaModelElement instanceof DefaultProperty) {
        // Remove example value for complex datatypes
        edgeSourceMetaModelElement.exampleValue = null;
        MxGraphHelper.updateLabel(edge.source, this.mxGraphAttributeService.graph, this.languageSettingsService);
      }
    });
  }

  private removeCells(edge: mxgraph.mxCell, parent: mxgraph.mxCell): void {
    const metaModel = MxGraphHelper.getModelElement(edge.target);

    if (metaModel instanceof DefaultUnit) return;

    // Remove icon if we delete the edge between enumeration and entity.
    if (metaModel instanceof DefaultEnumeration) {
      this.mxGraphShapeOverlayService.removeComplexTypeShapeOverlays(parent);
    }

    // TODO: Should be defined in more details
    if (metaModel instanceof DefaultEntityValue) {
      for (const child of metaModel.children) {
        MxGraphHelper.removeRelation(metaModel, child);
      }

      this.mxGraphAttributeService.graph.getOutgoingEdges(edge.target).forEach(outEdge => this.removeCells(outEdge, null));
      this.mxGraphService.removeCells([edge.target]);
      this.currentCachedFile.removeElement(metaModel.aspectModelUrn);
    }

    const parentModel = MxGraphHelper.getModelElement(edge.source);
    MxGraphHelper.removeRelation(parentModel, metaModel);
    this.mxGraphService.removeCells([edge]);
  }
}
