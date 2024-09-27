// Start of Selection
using Nexus_webapi.Models;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Nexus_webapi.Services
{
    public class TokenCleanupService : IHostedService, IDisposable
    {
        private readonly ILogger<TokenCleanupService> _logger;
        private Timer _timer;
        private readonly IServiceProvider _serviceProvider;
        private readonly JwtSettings _jwtSettings;

        public TokenCleanupService(IServiceProvider serviceProvider, ILogger<TokenCleanupService> logger, IOptions<JwtSettings> jwtSettings)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _jwtSettings = jwtSettings.Value;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Token Cleanup Service started.");
            // Schedule the cleanup to run based on token lifetime settings
            var cleanupInterval = TimeSpan.FromMinutes(_jwtSettings.TokenLifetimeMinutes);
            _timer = new Timer(DoWork, null, TimeSpan.Zero, cleanupInterval);
            return Task.CompletedTask;
        }

        private async void DoWork(object state)
        {
            _logger.LogInformation("Token Cleanup Service is working.");
            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<NexusDbContext>();
                    var now = DateTime.UtcNow;

                    // Find tokens that have expired
                    var expiredTokens = await context.UserTokens
                        .Where(ut => ut.Expiration <= now)
                        .ToListAsync();

                    if (expiredTokens.Any())
                    {
                        context.UserTokens.RemoveRange(expiredTokens);
                        await context.SaveChangesAsync();
                        _logger.LogInformation($"{expiredTokens.Count} expired tokens removed.");
                    }
                    else
                    {
                        _logger.LogInformation("No expired tokens found.");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while cleaning up tokens.");
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Token Cleanup Service stopping.");
            _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}
