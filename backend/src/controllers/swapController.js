// ... ऊपर का पुराना कोड वैसे ही रहने दें ...

// 👇 Is function ko file ke end me add karein
const deleteSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });

    // Sirf requester ya owner hi delete kar sake (Security)
    if (swap.requester.toString() !== req.user.id && swap.owner.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    await Swap.findByIdAndDelete(req.params.id);
    res.json({ message: 'Swap deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 👇 Export update karna mat bhulna (deleteSwap add kiya)
module.exports = { createSwap, listUserSwaps, acceptSwap, rejectSwap, completeSwap, deleteSwap };