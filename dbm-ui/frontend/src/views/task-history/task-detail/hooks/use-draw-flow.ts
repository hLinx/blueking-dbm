import { onMounted, useTemplateRef } from 'vue';

import { getTaskflowDetailsNew, type IPipelineActivities } from '@services/source/taskflow';

import { Graph } from '@antv/x6';

type FlowsDetail = ServiceReturnType<typeof getTaskflowDetailsNew>;

Graph.registerNode('step-node', {
  attrs: {
    body: {
      fill: '#fff',
      height: 48,
      rx: 4,
      ry: 4,
      width: 280,
      x: 0,
      y: 0,
    },
    label: {
      height: 48,
      width: 232,
      x: 56,
      y: 20,
    },
    result: {
      height: 48,
      width: 232,
      x: 56,
      y: 40,
    },
    status: {
      height: 48,
      rx: 4,
      ry: 4,
      width: 48,
      x: 0,
      y: 0,
    },
  },
  markup: [
    {
      selector: 'body',
      style: {
        boxShadow: '0 2px 4px 0 rgba(25, 25, 41, 0.1)',
      },
      tagName: 'rect',
    },
    {
      selector: 'status',
      tagName: 'rect',
    },
    {
      selector: 'label',
      style: {
        color: '#ddd',
        fontSize: '12px',
        fontWeight: 'bold',
      },
      tagName: 'text',
    },
    {
      selector: 'result',
      style: {
        color: '#ddd',
        fontSize: '12px',
      },
      tagName: 'text',
    },
  ],
  ports: {
    groups: {
      group1: {
        attrs: {
          circle: {
            fill: '#fff',
            magnet: true,
            r: 2,
            stroke: '#31d0c6',
            strokeWidth: 1,
          },
        },
        position: {
          name: 'absolute',
        },
      },
    },
  },
});

// const stepLineMap: Record<string, string> = {};

export default () => {
  let graph: Graph;

  const canvasRef = useTemplateRef<HTMLElement>('canvasRef');

  const run = (data: FlowsDetail) => {
    const startNode = graph.createNode({
      height: 48,
      id: data.start_event.id,
      label: 'start',
      shape: 'circle',
      width: 48,
      x: 100,
      y: 40,
    });

    const traversalPipeline = (data: IPipelineActivities['pipeline'], depth = 0, breadth = 0) => {
      let localDepth = 0;
      let localBreadth = 0;

      const parseOutgoing = (outgoing: string, depth = 0, breadth = 0) => {
        const stepFlow = data.flows[outgoing];
        const activitItem = data.activities[stepFlow.target];

        if (activitItem) {
          console.log('print node = ', activitItem.name);
          if ('pipeline' in activitItem && activitItem.pipeline) {
            localDepth += 1;
            graph.addNode({
              attrs: {
                label: {
                  text: activitItem.name, // 文字
                },
                result: {
                  style: {
                    color: activitItem.status === 'FAILED' ? '#ea3636' : '#4bc7ad',
                  },
                  text: activitItem.status === 'FAILED' ? '执行失败' : '执行成功',
                },
                status: {
                  fill: activitItem.status === 'FAILED' ? '#ea3636' : '#4bc7ad',
                },
              },
              id: activitItem.pipeline.start_event.id,
              shape: 'step-node',
              x: 200 + depth * 300,
              y: 40 + breadth * 180,
            });
            traversalPipeline(activitItem.pipeline, localDepth, localBreadth);
          } else {
            localBreadth += 1;
            localDepth += 1;

            graph.addNode({
              attrs: {
                label: {
                  text: activitItem.name, // 文字
                },
                result: {
                  style: {
                    color: activitItem.status === 'FAILED' ? '#ea3636' : '#4bc7ad',
                  },
                  text: activitItem.status === 'FAILED' ? '执行失败' : '执行成功',
                },
                status: {
                  fill: activitItem.status === 'FAILED' ? '#ea3636' : '#4bc7ad',
                },
              },
              id: activitItem.id,
              shape: 'step-node',
              x: 200 + depth * 300,
              y: 40 + breadth * 180,
            });
            parseOutgoing(activitItem.outgoing, localDepth, breadth);
          }
        }

        const gatewayItem = data.gateways[stepFlow.target];
        if (gatewayItem) {
          const outgoing = Array.isArray(gatewayItem.outgoing) ? gatewayItem.outgoing : [gatewayItem.outgoing];
          outgoing.forEach((targetId) => {
            localDepth += 1;
            if (data.activities[targetId] && 'pipeline' in activitItem) {
              traversalPipeline(data.activities[targetId].pipeline, localDepth, localBreadth);
            } else {
              parseOutgoing(targetId, localDepth, localBreadth);
            }
          });
        }
      };

      parseOutgoing(data.start_event.outgoing, depth, breadth);
    };
    traversalPipeline(data as any);

    graph.addCell(startNode);
  };

  onMounted(() => {
    graph = new Graph({
      autoResize: true,
      // interacting: false,
      background: {
        color: '#f5f7fb',
      },
      container: canvasRef.value as HTMLElement,
      grid: true,
      height: 600,
      mousewheel: true,
      panning: true,
      width: canvasRef.value!.getBoundingClientRect().width,
    });
  });

  return { run };
};
