<!--
 * TencentBlueKing is pleased to support the open source community by making 蓝鲸智云-DB管理系统(BlueKing-BK-DBM) available.
 *
 * Copyright (C) 2017-2023 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License athttps://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for
 * the specific language governing permissions and limitations under the License.
-->

<template>
  <tr>
    <FixedColumn fixed="left">
      <RenderSlave
        ref="slaveRef"
        :tab-list-config="tabListConfig"
        v-model="localSlave" />
    </FixedColumn>
    <td style="padding: 0">
      <RenderCluster
        ref="clusterRef"
        :slave="localSlave" />
    </td>
    <OperateColumn
      :removeable="removeable"
      @add="handleAppend"
      @remove="handleRemove" />
  </tr>
</template>
<script lang="ts">
  import { useI18n } from 'vue-i18n';
  import FixedColumn from '@components/render-table/columns/fixed-column/index.vue';
  import OperateColumn from '@components/render-table/columns/operate-column/index.vue';
  import { ClusterTypes } from '@common/const';
  import { random } from '@utils';

  import RenderCluster from './RenderCluster.vue';
  import RenderSlave from '@views/db-manage/mysql/common/edit-field/InstanceWithSelector.vue';

  export interface IDataRow {
    rowKey: string;
    slave?: {
      bkCloudId: number;
      bkHostId: number;
      ip: string;
      port: number;
      instanceAddress: string;
      clusterId: number;
    };
    clusterId?: number;
  }

  // 创建表格数据
  export const createRowData = (data = {} as Partial<IDataRow>) => ({
    rowKey: random(),
    slave: data.slave,
    clusterId: data.clusterId,
  });
</script>
<script setup lang="ts">
  interface Props {
    data: IDataRow;
    removeable: boolean;
  }
  interface Emits {
    (e: 'add', params: Array<IDataRow>): void;
    (e: 'remove'): void;
  }

  interface Exposes {
    getValue: () => Promise<any>;
  }

  const props = defineProps<Props>();

  const emits = defineEmits<Emits>();

  const { t } = useI18n();

  const slaveRef = ref();
  const clusterRef = ref();
  const localSlave = ref<IDataRow['slave']>();

  const tabListConfig = {
    [ClusterTypes.TENDBHA]: [
      {
        name: t('目标从库实例'),
        tableConfig: {
          firsrColumn: {
            label: 'slave',
            role: 'slave',
          },
        },
        multiple: false,
      },
    ],
  };

  watch(
    () => props.data,
    () => {
      if (props.data) {
        localSlave.value = props.data.slave;
      }
    },
    {
      immediate: true,
    },
  );

  const handleAppend = () => {
    emits('add', [createRowData()]);
  };

  const handleRemove = () => {
    if (props.removeable) {
      return;
    }
    emits('remove');
  };

  defineExpose<Exposes>({
    getValue() {
      return Promise.all([slaveRef.value.getValue('master_ip'), clusterRef.value.getValue()]).then(
        ([sourceData, moduleData]) => ({
          ...sourceData,
          ...moduleData,
        }),
      );
    },
  });
</script>
