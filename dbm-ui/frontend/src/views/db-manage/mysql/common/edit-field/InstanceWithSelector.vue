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
  <TableEditInput
    ref="inputRef"
    class="cluster-name-with-selector"
    v-model="localValue"
    :placeholder="placeholder ? placeholder : t('请输入IP:Port或从表头批量选择')"
    :rules="rules"
    @error="handleInputError"
    @blur="() => (isFocused = false)"
    @focus="() => (isFocused = true)">
    <template #suspend>
      <BkPopover
        v-if="!isFocused"
        :content="t('选择实例')"
        placement="top"
        :popover-delay="0">
        <div class="edit-btn-wraper">
          <div
            class="edit-btn"
            @click="handleClickSeletor">
            <div class="edit-btn-inner">
              <DbIcon
                class="select-icon"
                type="host-select" />
            </div>
          </div>
        </div>
      </BkPopover>
    </template>
  </TableEditInput>
  <InstanceSelector
    v-model:is-show="isShowInstanceSelecotr"
    :cluster-types="[ClusterTypes.TENDBHA]"
    :selected="selectedIntances"
    :tab-list-config="tabListConfig"
    @change="handleInstancesChange" />
</template>
<script setup lang="ts">
  import _ from 'lodash';
  import { useI18n } from 'vue-i18n';
  import TendbhaInstanceModel from '@services/model/mysql/tendbha-instance';
  import TableEditInput from '@components/render-table/columns/input/index.vue';
  import { ClusterTypes } from '@common/const';
  import { ipPort } from '@common/regex';
  import { checkMysqlInstances } from '@services/source/instances';
  import InstanceSelector, {
    type InstanceSelectorValues,
    type PanelListType,
  } from '@components/instance-selector/Index.vue';

  export interface InstanceBasicInfo {
    ip: string;
    port: number;
    instanceAddress?: string;
    cloudId?: number;
    hostId?: number;
    clusterId?: number;
  }

  interface Props {
    clusterTypes?: string[];
    placeholder?: string;
    tabListConfig?: Record<ClusterTypes, PanelListType>;
  }

  interface Emits {
    (e: 'instanceChange', value: InstanceBasicInfo): void;
    (e: 'error', value: boolean): void;
  }

  interface Exposes {
    getValue: () => Promise<{ cluster_id: number }>;
    focus: () => void;
  }

  withDefaults(defineProps<Props>(), {
    clusterTypes: () => [ClusterTypes.TENDBHA],
  });

  const emits = defineEmits<Emits>();

  const modelValue = defineModel<InstanceBasicInfo>();

  const { t } = useI18n();

  const inputRef = ref();
  const isFocused = ref(false);
  const isShowInstanceSelecotr = ref(false);
  const localValue = ref('');
  const selectedIntances = shallowRef<InstanceSelectorValues<TendbhaInstanceModel>>({ [ClusterTypes.TENDBHA]: [] });

  const rules = [
    {
      validator: (value: string) => Boolean(_.trim(value)),
      message: t('不能为空'),
    },
    {
      validator: (value: string) => ipPort.test(value),
      message: t('格式不正确'),
    },
    {
      validator: (value: string) =>
        checkMysqlInstances({
          bizId: window.PROJECT_CONFIG.BIZ_ID,
          instance_addresses: [value],
        }).then((data) => {
          if (data.length < 1) {
            return false;
          }
          const [instanceData] = data;
          if (
            !modelValue.value?.instanceAddress ||
            modelValue.value.instanceAddress !== instanceData.instance_address
          ) {
            modelValue.value = {
              cloudId: instanceData.bk_cloud_id,
              hostId: instanceData.bk_host_id,
              ip: instanceData.ip,
              port: instanceData.port,
              instanceAddress: instanceData.instance_address,
              clusterId: instanceData.cluster_id,
            };
            emits('instanceChange', modelValue.value);
          }
          return true;
        }),
      message: t('实例不存在'),
    },
  ];

  watch(
    () => modelValue.value,
    () => {
      if (!modelValue.value) {
        return;
      }
      localValue.value = `${modelValue.value.ip}:${modelValue.value.port}`;
    },
    {
      immediate: true,
    },
  );

  const handleClickSeletor = () => {
    isShowInstanceSelecotr.value = true;
  };

  // 批量选择
  const handleInstancesChange = (selected: InstanceSelectorValues<TendbhaInstanceModel>) => {
    selectedIntances.value = selected;
    const list = selected[ClusterTypes.TENDBHA];
    localValue.value = list[0].instance_address;
    window.changeConfirm = true;
    setTimeout(() => {
      inputRef.value.getValue();
    });
  };

  const handleInputError = (value: boolean) => {
    emits('error', value);
  };

  defineExpose<Exposes>({
    getValue() {
      return inputRef.value.getValue().then(() => modelValue.value);
    },
    focus() {
      inputRef.value.focus();
    },
  });
</script>
<style lang="less" scoped>
  .cluster-name-with-selector {
    &:hover {
      :deep(.edit-btn-wraper) {
        display: block;
      }
    }
  }

  .edit-btn-wraper {
    display: none;

    .edit-btn {
      display: flex;
      width: 24px;
      height: 40px;
      align-items: center;

      .edit-btn-inner {
        display: flex;
        width: 24px;
        height: 24px;
        cursor: pointer;
        border-radius: 2px;
        align-items: center;
        justify-content: center;

        .select-icon {
          font-size: 16px;
          color: #979ba5;
        }

        &:hover {
          background: #f0f1f5;

          .select-icon {
            color: #3a84ff;
          }
        }
      }
    }
  }
</style>
