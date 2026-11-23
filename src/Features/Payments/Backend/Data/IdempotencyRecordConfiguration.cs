using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public sealed class IdempotencyRecordConfiguration : IEntityTypeConfiguration<IdempotencyRecord>
{
    public void Configure(EntityTypeBuilder<IdempotencyRecord> builder)
    {
        builder.HasKey(x => x.ScopeKey);
        builder.Property(x => x.ScopeKey).HasMaxLength(350).IsRequired();
        builder.Property(x => x.ResponseJson).IsRequired();
        builder.HasIndex(x => x.ExpiresAtUtc);
    }
}
