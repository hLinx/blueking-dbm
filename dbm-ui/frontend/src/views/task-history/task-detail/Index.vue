<template>
  <div>
    hello detail
    <div ref="canvasRef" />
  </div>
</template>
<script setup lang="ts">
  import { useRequest } from 'vue-request';
  import { useRoute } from 'vue-router';

  import { getTaskflowDetailsNew } from '@services/source/taskflow';

  import useDrawFlow from './hooks/use-draw-flow';

  const route = useRoute();

  const { run } = useDrawFlow();

  const rootId = route.params.rootId as string;

  useRequest(getTaskflowDetailsNew, {
    defaultParams: [
      {
        rootId,
      },
    ],
    onSuccess(data) {
      run(data);
    },
  });
</script>
