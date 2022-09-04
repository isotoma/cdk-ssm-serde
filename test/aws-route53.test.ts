import { Template } from 'aws-cdk-lib/assertions';
import { Stack } from 'aws-cdk-lib/core';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53SsmSerde from '../lib/aws-route53';

test('put hosted zone', () => {
    const stack = new Stack();

    const hostedZone = new route53.HostedZone(stack, 'HostedZone', {
        zoneName: 'example.com',
    });

    route53SsmSerde.HostedZone.toSsm(stack, {
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

    const hostedZone = route53SsmSerde.HostedZone.fromSsm(stack, 'HostedZone', {
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
