using System.ComponentModel.DataAnnotations;

namespace Nexus_webapi.Models;
public class LoginModel
{
    public string? Username { get; set; }

    public string? Email { get; set; }

    [Required]
    public string Password { get; set; }

}