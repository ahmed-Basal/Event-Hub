using Domain;
using Microsoft.EntityFrameworkCore;

namespace Application.Interfaces;

public interface IAppDbContext
{
    DbSet<Activity> Activities { get; set; }
    DbSet<ActivityAttendee> ActivityAttendees { get; set; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
