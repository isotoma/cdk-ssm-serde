import { Template } from 'aws-cdk-lib/assertions';
import { Stack } from 'aws-cdk-lib/core';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as eksSsmSerde from '../lib/aws-eks';

test('put eks cluster', () => {
    const stack = new Stack();

    const cluster = new eks.Cluster(stack, 'Cluster', {
        version: eks.KubernetesVersion.V1_20,
    });

    eksSsmSerde.Cluster.toSsm(stack, {
        parameterPrefix: '/mycluster',
        resource: cluster,
    });

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::SSM::Parameter', {
        Type: 'String',
        Name: '/mycluster/clusterName',
    });
    template.hasResourceProperties('AWS::SSM::Parameter', {
        Type: 'String',
        Name: '/mycluster/kubectlRoleArn',
    });
    template.hasResourceProperties('AWS::SSM::Parameter', {
        Type: 'String',
        Name: '/mycluster/openIdConnectProviderArn',
    });
});

test('get eks cluster', () => {
    const stack = new Stack();

    eksSsmSerde.Cluster.fromSsm(stack, 'Cluster', {
        parameterPrefix: '/mycluster',
    });
});
