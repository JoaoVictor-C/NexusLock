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

// Add configuration for JWT
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));

// Configure Services
ConfigureServices(builder.Services, builder.Configuration);

// Set the URL to listen on the port provided by Cloud Run
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(int.Parse(port));
});

// Build the application
var app = builder.Build();

// Add Health Checks
builder.Services.AddHealthChecks();

app.MapHealthChecks("/health");

// Configure Middleware Pipeline
ConfigureMiddleware(app);

app.Run();

// Method to configure services
void ConfigureServices(IServiceCollection services, IConfiguration configuration)
{
    // Database Context
    services.AddDbContext<NexusDbContext>(options =>
        options.UseMySql(configuration.GetConnectionString("DefaultConnection"),
            new MySqlServerVersion(new Version(8, 0, 21))));

    // Controllers and Swagger
    services.AddControllers();
    services.AddEndpointsApiExplorer();

    // Register Services and Handlers
    services.AddHostedService<TokenCleanupService>();
    services.AddScoped<IAuthorizationHandler, PermissionHandler>();

    // Configure CORS
    services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
            policy.WithOrigins("https://nexus-lock.vercel.app", "http://179.108.15.18")
            .AllowAnyHeader()
            .AllowAnyMethod());
    });

    // Add Authorization
    services.AddAuthorization(options =>
    {
        options.AddPolicy("AdminAccess", policy =>
            policy.RequireClaim("permission", "AdminAccess"));
    });

    builder.Services.AddSwaggerGen(c =>
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

// Method to configure middleware
void ConfigureMiddleware(WebApplication app)
{
    // Enable Swagger in all environments
    app.UseSwagger();
    app.UseSwaggerUI();

    app.UseHttpsRedirection();

    app.UseCors(); // Ensure CORS is enabled before Authentication

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();
}
