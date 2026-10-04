using Domain;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Persistence;

public class DevMeetDbContext(DbContextOptions<DevMeetDbContext> options) 
    : DbContext(options), IDataProtectionKeyContext
{
    public required DbSet<Activity> Activities { get; set; }
    public DbSet<DataProtectionKey> DataProtectionKeys { get; set; } = null!;
}
