/*
 * TencentBlueKing is pleased to support the open source community by making 蓝鲸智云-DB管理系统(BlueKing-BK-DBM) available.
 *
 * Copyright (C) 2017-2023 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for
 * the specific language governing permissions and limitations under the License.
 */

import KafkaModel from '@services/model/kafka/kafka';
import KafkaInstanceModel from '@services/model/kafka/kafka-instance';
import KafkaNodeModel from '@services/model/kafka/kafka-node';
import KafkaPasswordModel from '@services/model/kafka/kafka-password';

import { useGlobalBizs } from '@stores';

import http from '../http';
import type { ListBase } from '../types';

const { currentBizId } = useGlobalBizs();

const path = `/apis/bigdata/bizs/${currentBizId}/kafka/kafka_resources`;

/**
 * 获取集群列表
 */
export function getKafkaList(params: Record<string, any> & { bk_biz_id: number }) {
  return http.get<ListBase<KafkaModel[]>>(`${path}/`, params).then((data) => ({
    ...data,
    results: data.results.map(
      (item: KafkaModel) =>
        new KafkaModel(
          Object.assign(item, {
            permission: Object.assign({}, item.permission, data.permission),
          }),
        ),
    ),
  }));
}

/**
 * 获取查询返回字段
 */
export function getKafkaTableFields() {
  return http.get<ListBase<KafkaModel[]>>(`${path}/get_table_fields/`);
}

/**
 * 获取实例列表
 */
export function getKafkaInstanceList(params: Record<string, any> & { bk_biz_id: number }) {
  return http.get<ListBase<KafkaInstanceModel[]>>(`${path}/list_instances/`, params).then((data) => ({
    ...data,
    results: data.results.map((item: KafkaInstanceModel) => new KafkaInstanceModel(item)),
  }));
}

/**
 * 获取实例详情
 */
export function retrieveKafkaInstance(params: { bk_biz_id: number }) {
  return http.get<ListBase<KafkaModel[]>>(`${path}/retrieve_instance/`, params);
}

/**
 * 获取集群详情
 */
export function getKafkaDetail(params: { id: number }) {
  return http.get<KafkaModel>(`${path}/${params.id}/`).then((data) => new KafkaModel(data));
}

// 获取集群详情（入口配置）
export function getClusterDetailEntryConfig(params: { id: number }) {
  return http.get<KafkaModel>(`${path}/${params.id}/`).then((data) => new KafkaModel(data));
}

/**
 * 获取集群拓扑
 */
export function getKafkaTopoGraph(params: { cluster_id: number }) {
  return http.get<ListBase<KafkaModel[]>>(`${path}/${params.cluster_id}/get_topo_graph/`);
}

/**
 * 获取 Kafka 集群访问密码
 */
export function getKafkaPassword(params: Record<string, any> & { cluster_id: number }) {
  return http
    .get<KafkaPasswordModel>(`${path}/${params.cluster_id}/get_password/`)
    .then((data) => new KafkaPasswordModel(data));
}

/**
 * 获取 Kafka 集群节点列表信息
 */
export function getKafkaNodeList(
  params: Record<string, any> & {
    bk_biz_id: number;
    cluster_id: number;
  },
) {
  return http.get<ListBase<Array<KafkaNodeModel>>>(`${path}/${params.cluster_id}/list_nodes/`, params).then((data) => ({
    ...data,
    results: data.results.map(
      (item) =>
        new KafkaNodeModel(
          Object.assign(item, {
            permission: data.permission,
          }),
        ),
    ),
  }));
}

/**
 * 导出集群数据为 excel 文件
 */
export function exportKafkaClusterToExcel(params: { cluster_ids?: number[] }) {
  return http.post<string>(`${path}/export_cluster/`, params, { responseType: 'blob' });
}

/**
 * 导出实例数据为 excel 文件
 */
export function exportKafkaInstanceToExcel(params: { bk_host_ids?: number[] }) {
  return http.post<string>(`${path}/export_instance/`, params, { responseType: 'blob' });
}
