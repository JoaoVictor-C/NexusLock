using Nexus_webapi.Models;

namespace Nexus_webapi.Services
{
    public class TokenCleanupService : IHostedService, IDisposable
    {
        private readonly ILogger<TokenCleanupService> _logger;
        private Timer _timer;
        private readonly IServiceProvider _serviceProvider;

        public TokenCleanupService(IServiceProvider serviceProvider, ILogger<TokenCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Token Cleanup Service started.");
            // Schedule the cleanup to run every hour
            _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromHours(1));
            return Task.CompletedTask;
        }

        private void DoWork(object state)
        {
            _logger.LogInformation("Token Cleanup Service is working.");
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<NexusDbContext>();
                var now = DateTime.UtcNow;

                // Find tokens where either the access token or refresh token has expired
                var expiredTokens = context.UserTokens
                    .Where(ut => ut.Expiration <= now )
                    .ToList();

                if (expiredTokens.Any())
                {
                    context.UserTokens.RemoveRange(expiredTokens);
                    context.SaveChanges();
                    _logger.LogInformation($"{expiredTokens.Count} expired tokens removed.");
                }
                else
                {
                    _logger.LogInformation("No expired tokens found.");
                }
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
