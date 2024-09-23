# Use the official .NET 8.0 SDK image for building the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app

# Copy the csproj file and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy the remaining source code and publish the application
COPY . ./
RUN dotnet publish -c Release -o out

# Use the official .NET 8.0 runtime image for running the application
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-env /app/out ./

# Set environment variables (replace with your actual values or use a secrets manager)
ENV CONNECTION_STRING="server=34.39.140.44;port=3306;database=db_nexuslock;user=joao;password=)e3}Uv0u2@DTApja;"
ENV JWT_SECRET="8x/A?D(G+KbPeShVmYq3t6w9z$C&F)J@!kLnMpQrStUvWxYz1234567890"
ENV JWT_ISSUER="http://localhost:5223"
ENV JWT_AUDIENCE="http://localhost:5223"

# Expose the port your application runs on
EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "api.dll"]