namespace Core.Domain;

public sealed partial class Activity
{
    public void Cancel() => IsCancelled = true;

    public void Reactivate() => IsCancelled = false;
}
