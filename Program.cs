using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Nexus_webapi.Authorization;
using Nexus_webapi.Models;
using Nexus_webapi.Services;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using Nexus_webapi.Filters;

var builder = WebApplication.CreateBuilder(args);

ConfigureServices(builder.Services, builder.Configuration);
ConfigureWebHost(builder.WebHost);

var app = builder.Build();

ConfigureMiddleware(app);

app.Run();

void ConfigureServices(IServiceCollection services, IConfiguration configuration)
{
    services.Configure<JwtSettings>(configuration.GetSection("Jwt"));

    ConfigureDatabase(services, configuration);
    ConfigureSwagger(services);
    ConfigureCors(services);
    ConfigureAuthorization(services);

    services.AddControllers();
    services.AddEndpointsApiExplorer();
    services.AddHostedService<TokenCleanupService>();
    services.AddScoped<IAuthorizationHandler, PermissionHandler>();
    services.AddScoped<IAuthService, AuthService>();

    // Add JWT Authentication
    var jwtSettings = configuration.GetSection("Jwt").Get<JwtSettings>();
    services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings.Issuer,
                ValidAudience = jwtSettings.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret))
            };
        });
}

void ConfigureWebHost(IWebHostBuilder webHost)
{
    var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
    webHost.ConfigureKestrel(options =>
    {
        options.ListenAnyIP(int.Parse(port));
    });
}

void ConfigureDatabase(IServiceCollection services, IConfiguration configuration)
{
    services.AddDbContext<NexusDbContext>(options =>
        options.UseMySql(configuration.GetConnectionString("DefaultConnection"),
            new MySqlServerVersion(new Version(8, 0, 21))));
}

void ConfigureSwagger(IServiceCollection services)
{
    services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "Nexus API", Version = "v1" });
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });
        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
        c.OperationFilter<SecurityRequirementsOperationFilter>();
    });
}

void ConfigureCors(IServiceCollection services)
{
    services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
            policy.WithOrigins("*")
            .AllowAnyHeader()
            .AllowAnyMethod()
        );
    });
}

void ConfigureAuthorization(IServiceCollection services)
{
    services.AddAuthorization(options =>
    {
        options.AddPolicy("AdminAccess", policy =>
            policy.RequireClaim("permission", "AdminAccess"));
    });
}

void ConfigureMiddleware(WebApplication app)
{
    app.UseSwagger();
    app.UseSwaggerUI();

    app.UseHttpsRedirection();
    app.UseCors();
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();
}
