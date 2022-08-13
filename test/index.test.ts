import { Template } from 'aws-cdk-lib/assertions';
import { Stack } from 'aws-cdk-lib/core';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ssmSerde from '../';

test('put hosted zone', () => {
    const stack = new Stack();

    const hostedZone = new route53.HostedZone(stack, 'HostedZone', {
        zoneName: 'example.com',
    });

    ssmSerde.putHostedZone(stack, {
        parameterPrefix: '/myhostedzone',
        resource: hostedZone,
    });

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::SSM::Parameter', {
        Type: 'String',
        Name: '/myhostedzone/hostedZoneId',
    });
    template.hasResourceProperties('AWS::SSM::Parameter', {
        Type: 'String',
        Name: '/myhostedzone/zoneName',
    });
});

test('get hosted zone', () => {
    const stack = new Stack();

    const hostedZone = ssmSerde.getHostedZone(stack, 'HostedZone', {
        parameterPrefix: '/myhostedzone',
    });

    new route53.CnameRecord(stack, 'CnameRecord', {
        zone: hostedZone,
        domainName: 'foo.example.com',
        recordName: 'bar',
    });

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Route53::RecordSet', {
        Type: 'CNAME',
        ResourceRecords: ['foo.example.com'],
    });
});

test('put eks cluster', () => {
    const stack = new Stack();

    const cluster = new eks.Cluster(stack, 'Cluster', {
        version: eks.KubernetesVersion.V1_20,
    });

    ssmSerde.putEksCluster(stack, {
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

    ssmSerde.getEksCluster(stack, 'Cluster', {
        parameterPrefix: '/mycluster',
    });
});
