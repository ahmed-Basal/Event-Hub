using Microsoft.Extensions.DependencyInjection;

namespace Diagnostics.Module;

public static class DiagnosticsModule
{
    public static IServiceCollection AddDiagnosticsModule(this IServiceCollection services)
        => services;
}
