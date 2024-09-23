namespace Nexus_webapi.Models
{
    public class JwtSettings
    {
        public string Secret { get; set; }
        public int TokenLifetimeMinutes { get; set; }
        public string Issuer { get; set; }
        public string Audience { get; set; }
    }
}