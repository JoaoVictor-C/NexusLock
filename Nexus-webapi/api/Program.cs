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

var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>();
var key = Encoding.ASCII.GetBytes(jwtSettings.Secret);

// Configure Services
ConfigureServices(builder.Services, builder.Configuration);

// Add Authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminAccess", policy =>
        policy.RequireClaim("Permission", "AdminAccess"));
});

// Add Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = true;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtSettings.Audience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateLifetime = true,
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                context.Token = authHeader.Substring("Bearer ".Length).Trim();
            }
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine($"Token validated for user: {context.Principal?.Identity?.Name}");
            return Task.CompletedTask;
        },
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"Authentication failed: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            Console.WriteLine($"Authentication challenge issued: {context.Error}, {context.ErrorDescription}");
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddScoped<IAuthService, AuthService>();

// Add Token Cleanup Service
builder.Services.AddHostedService<TokenCleanupService>();

builder.Services.AddLogging(loggingBuilder =>
{
    loggingBuilder.AddFilter("Microsoft.EntityFrameworkCore.Database.Command", LogLevel.Warning);
    loggingBuilder.AddFilter("Microsoft.EntityFrameworkCore", LogLevel.Warning);
    loggingBuilder.AddFilter("Microsoft.AspNetCore.Cors.Infrastructure.CorsService", LogLevel.None);
});

builder.Environment.EnvironmentName = "Production";

builder.WebHost.UseUrls("http://0.0.0.0:8080");

var app = builder.Build();


// Configure Middleware Pipeline
ConfigureMiddleware(app);

app.Run();

// Method to configure services
void ConfigureServices(IServiceCollection services, IConfiguration configuration)
{
    // Database Context
    //services.AddDbContext<NexusDbContext>(options =>
    //    options.UseMySql(configuration.GetConnectionString("DefaultConnection"),
    //        new MySqlServerVersion(new Version(8, 0, 21))));

    // Controllers and Swagger
    services.AddControllers();
    services.AddEndpointsApiExplorer();
    

    // Register Services and Handlers
    // services.AddHostedService<TokenCleanupService>();

    services.AddScoped<IAuthorizationHandler, PermissionHandler>();

    // Configure CORS
    services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
            policy.WithOrigins("https://nexus-lock.vercel.app")
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
