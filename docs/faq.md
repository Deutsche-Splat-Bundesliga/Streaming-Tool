# Frequently Asked Questions

## Can you update me when a new version releases?

No. GitHub offers notifications on new releases, and running after everyone to give updates will at one point be too much of a hassle.

## The starting script isn't running, what can I do?

If you are on a Windows environment, check whether your execution policy is set to `RemoteSigned`:

```ps
Get-ExecutionPolicy
```

If not, set it using this command:

```ps
Set-ExecutionPolicy -Policy RemoteSigned
```

If the issue still persists, feel free to open an Issue, we will try to help you as soon as we can.

## Can I use this tool for myself?

Yes, you can! Please be aware that, according to our license, you are required to keep the source code open-source and offer all your users access to it at all times. We recommend simply forking this repository to guarantee this. For more information, please check out our [license][License].

## Can I use this tool commercially?

Yes, you can! The same conditions as above apply.

[License]: https://github.com/Hazeolation-Productions/Streaming-Tool/blob/master/LICENSE
