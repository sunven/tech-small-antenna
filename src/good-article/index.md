---
title: "wsl 基本使用"
description: "WSL (Windows Subsystem for Linux) 的基本安装、配置、使用方法以及常见问题的解决方案。"
tags: ["wsl", "linux", "windows"]
---


[走近比特币：一个故事看懂“区块链”](http://www.4hou.com/info/news/6152.html)

狭义来讲，区块链是一种按照时间顺序将数据区块以顺序相连的方式组合成的一 种链式数据结构， 并以密码学方式保证的不可篡改和不可伪造的分布式账本

[我用了两个月的时间才理解 let](https://zhuanlan.zhihu.com/p/28140450)

1. let 的「创建」过程被提升了，但是初始化没有提升。
2. var 的「创建」和「初始化」都被提升了。
3. function 的「创建」「初始化」和「赋值」都被提升了。

[服务的扩展性](http://www.cnblogs.com/loveis715/p/5097475.html)

应用的扩展：纵向、横向（AKF）

服务的扩展：Z轴、缓存、异步

数据库的扩展：CAP、纵向扩展、Master-Slave、

[企业级负载平衡简介](https://www.cnblogs.com/loveis715/p/4547968.html)

基于DNS的负载平衡、L3/4负载平衡、L7负载平衡、SSL Farm

[Microservice架构模式简介](https://www.cnblogs.com/loveis715/p/4644266.html)

服务分割、粗粒度的API

公共服务:在保持和各个子服务的松耦合性的同时还需要提供一个足够通用的，能够在一定程度上满足所有当前和未来子服务要求的解决方案  因此在集中的公共服务中，我们需要使用较为细粒度的模型

Microservice架构模式中的“开”是各个服务的内部实现，而其中的“闭”则是各个服务之间相互沟通的方式

[200行代码，7个对象——让你了解ASP.NET Core框架的本质](https://www.cnblogs.com/artech/p/inside-asp-net-core-framework.html)

HttpContext、RequestDelegate、Middleware、ApplicationBuilder、Server、WebHost、WebHostBuilder

```csharp
public class Program
{
    public static async Task Main(string[] args)
    {
        await new WebHostBuilder()
            .UseHttpListener()
            .Configure(app => app
                .Use(FooMiddleware)
                .Use(BarMiddleware)
                .Use(BazMiddleware))
            .Build()
            .StartAsync();
    }

    private static RequestDelegate FooMiddleware(RequestDelegate next)
        => async context =>
        {
            await context.Response.WriteAsync("Foo=>");
            await next(context);
        };

    private static RequestDelegate BarMiddleware(RequestDelegate next)
        => async context =>
        {
            await context.Response.WriteAsync("Bar=>");

            await next(context);
        };

    private static RequestDelegate BazMiddleware(RequestDelegate next)
        => context => context.Response.WriteAsync("Baz");
}

public static partial class Extensions
{
    public static IWebHostBuilder UseHttpListener(this IWebHostBuilder builder, params string[] urls)
        => builder.UseServer(new HttpListenerServer(urls));

    public static Task WriteAsync(this HttpResponse response, string contents)
    {
        var buffer = Encoding.UTF8.GetBytes(contents);
        return response.Body.WriteAsync(buffer, 0, buffer.Length);
    }
}


public delegate Task RequestDelegate(HttpContext context);

public class HttpContext
{
    private HttpRequest Request { get; }
    public HttpResponse Response { get; }

    public HttpContext(IFeatureCollection features)
    {
        Request = new HttpRequest(features);
        Response = new HttpResponse(features);
    }
}

public class HttpRequest
{
    private readonly IHttpRequestFeature _feature;

    public Uri Url => _feature.Url;
    public NameValueCollection Headers => _feature.Headers;
    public Stream Body => _feature.Body;

    public HttpRequest(IFeatureCollection features) => _feature = features.Get<IHttpRequestFeature>();
}

public class HttpResponse
{
    private readonly IHttpResponseFeature _feature;

    public NameValueCollection Headers => _feature.Headers;
    public Stream Body => _feature.Body;

    public int StatusCode
    {
        get => _feature.StatusCode;
        set => _feature.StatusCode = value;
    }

    public HttpResponse(IFeatureCollection features) => _feature = features.Get<IHttpResponseFeature>();
}

public interface IApplicationBuilder
{
    IApplicationBuilder Use(Func<RequestDelegate, RequestDelegate> middleware);
    RequestDelegate Build();
}

public class ApplicationBuilder : IApplicationBuilder
{
    private readonly List<Func<RequestDelegate, RequestDelegate>> _middlewares =
        new List<Func<RequestDelegate, RequestDelegate>>();

    public RequestDelegate Build()
    {
        return httpContext =>
        {
            RequestDelegate next = _ =>
            {
                _.Response.StatusCode = 404;
                return Task.CompletedTask;
            };
            _middlewares.Reverse();
            foreach (var middleware in _middlewares)
            {
                next = middleware(next);
            }

            return next(httpContext);
        };
    }

    public IApplicationBuilder Use(Func<RequestDelegate, RequestDelegate> middleware)
    {
        _middlewares.Add(middleware);
        return this;
    }
}

public interface IServer
{
    Task StartAsync(RequestDelegate handler);
}

public interface IFeatureCollection : IDictionary<Type, object>
{
}

public class FeatureCollection : Dictionary<Type, object>, IFeatureCollection
{
}

public static partial class Extensions
{
    public static T Get<T>(this IFeatureCollection features) =>
        features.TryGetValue(typeof(T), out var value) ? (T) value : default(T);

    public static IFeatureCollection Set<T>(this IFeatureCollection features, T feature)
    {
        features[typeof(T)] = feature;
        return features;
    }
}

public interface IHttpRequestFeature
{
    Uri Url { get; }
    NameValueCollection Headers { get; }
    Stream Body { get; }
}

public interface IHttpResponseFeature
{
    int StatusCode { get; set; }
    NameValueCollection Headers { get; }
    Stream Body { get; }
}

public class HttpListenerFeature : IHttpRequestFeature, IHttpResponseFeature
{
    private readonly HttpListenerContext _context;
    public HttpListenerFeature(HttpListenerContext context) => _context = context;

    Uri IHttpRequestFeature.Url => _context.Request.Url;
    NameValueCollection IHttpRequestFeature.Headers => _context.Request.Headers;
    NameValueCollection IHttpResponseFeature.Headers => _context.Response.Headers;
    Stream IHttpRequestFeature.Body => _context.Request.InputStream;
    Stream IHttpResponseFeature.Body => _context.Response.OutputStream;

    int IHttpResponseFeature.StatusCode
    {
        get => _context.Response.StatusCode;
        set => _context.Response.StatusCode = value;
    }
}

public class HttpListenerServer : IServer
{
    private readonly HttpListener _httpListener;
    private readonly string[] _urls;

    public HttpListenerServer(params string[] urls)
    {
        _httpListener = new HttpListener();
        _urls = urls.Any() ? urls : new[] {"http://localhost:5000/"};
    }

    public async Task StartAsync(RequestDelegate handler)
    {
        Array.ForEach(_urls, url => _httpListener.Prefixes.Add(url));
        _httpListener.Start();
        while (true)
        {
            var listenerContext = await _httpListener.GetContextAsync();
            var feature = new HttpListenerFeature(listenerContext);
            var features = new FeatureCollection()
                .Set<IHttpRequestFeature>(feature)
                .Set<IHttpResponseFeature>(feature);
            var httpContext = new HttpContext(features);
            await handler(httpContext);
            listenerContext.Response.Close();
        }
    }
}

public interface IWebHost
{
    Task StartAsync();
}


public class WebHost : IWebHost
{
    private readonly IServer _server;
    private readonly RequestDelegate _handler;

    public WebHost(IServer server, RequestDelegate handler)
    {
        _server = server;
        _handler = handler;
    }

    public Task StartAsync() => _server.StartAsync(_handler);
}

public interface IWebHostBuilder
{
    IWebHostBuilder UseServer(IServer server);
    IWebHostBuilder Configure(Action<IApplicationBuilder> configure);
    IWebHost Build();
}

public class WebHostBuilder : IWebHostBuilder
{
    private IServer _server;
    private readonly List<Action<IApplicationBuilder>> _configures = new List<Action<IApplicationBuilder>>();

    public IWebHostBuilder Configure(Action<IApplicationBuilder> configure)
    {
        _configures.Add(configure);
        return this;
    }

    public IWebHostBuilder UseServer(IServer server)
    {
        _server = server;
        return this;
    }

    public IWebHost Build()
    {
        var builder = new ApplicationBuilder();
        foreach (var configure in _configures)
        {
            configure(builder);
        }

        return new WebHost(_server, builder.Build());
    }
}
```
