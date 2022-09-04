# cdk-ssm-serde
For serializing and deserializing CDK constructs to and from SSM parameters

## Supported resources

- `aws-eks.Cluster`
- `aws-route53.HostedZone`

## Purpose

To manage dependencies between projects that use the same AWS
accounts, in such a way that they can be promoted through environments
without hard coded configuration.

## Example

```typescript
// Create your HostedZone
const hostedZone = new route53.HostedZone(stack, 'HostedZone', {
    zoneName: 'example.com',
});

// Put a reference to it into SSM
route53SsmSerde.HostedZone.toSsm(stack, {
    parameterPrefix: '/myhostedzone',
    resource: hostedZone,
});
```

Then, in a different stack, maybe even in a different repo in a different project, but deployed to the same AWS account:
```typescript
const hostedZone = route53SsmSerde.HostedZone.fromSsm(stack, 'HostedZone', {
    parameterPrefix: '/myhostedzone',
});
```

## Releasing a new version

- (Almost certainly) be on latest main, with no unpublished changes
- Run `npm version (patch|minor|major)` as appropriate
- Run `git push` and `git push origin TAG` where `TAG` is the tag that `npm version` just created

The tag triggers a Github Actions job to publish to npm.
