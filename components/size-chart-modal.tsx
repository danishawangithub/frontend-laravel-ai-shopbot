'use client';

import { X } from 'lucide-react';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeChartModal({ isOpen, onClose }: SizeChartModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border flex items-center justify-between p-6">
          <h2 className="text-2xl font-bold text-foreground">Size Chart</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded transition"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-muted-foreground mb-6">
            All measurements are in inches. Please measure your body while standing
            straight in comfortable clothing.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-secondary">
                  <th className="border border-border px-4 py-3 text-left font-semibold">
                    Size
                  </th>
                  <th className="border border-border px-4 py-3 text-left font-semibold">
                    Bust
                  </th>
                  <th className="border border-border px-4 py-3 text-left font-semibold">
                    Waist
                  </th>
                  <th className="border border-border px-4 py-3 text-left font-semibold">
                    Hip
                  </th>
                  <th className="border border-border px-4 py-3 text-left font-semibold">
                    Length
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border px-4 py-3 font-semibold">XS</td>
                  <td className="border border-border px-4 py-3">32</td>
                  <td className="border border-border px-4 py-3">26</td>
                  <td className="border border-border px-4 py-3">34</td>
                  <td className="border border-border px-4 py-3">40</td>
                </tr>
                <tr className="bg-secondary/30">
                  <td className="border border-border px-4 py-3 font-semibold">S</td>
                  <td className="border border-border px-4 py-3">34</td>
                  <td className="border border-border px-4 py-3">28</td>
                  <td className="border border-border px-4 py-3">36</td>
                  <td className="border border-border px-4 py-3">41</td>
                </tr>
                <tr>
                  <td className="border border-border px-4 py-3 font-semibold">M</td>
                  <td className="border border-border px-4 py-3">36</td>
                  <td className="border border-border px-4 py-3">30</td>
                  <td className="border border-border px-4 py-3">38</td>
                  <td className="border border-border px-4 py-3">42</td>
                </tr>
                <tr className="bg-secondary/30">
                  <td className="border border-border px-4 py-3 font-semibold">L</td>
                  <td className="border border-border px-4 py-3">38</td>
                  <td className="border border-border px-4 py-3">32</td>
                  <td className="border border-border px-4 py-3">40</td>
                  <td className="border border-border px-4 py-3">43</td>
                </tr>
                <tr>
                  <td className="border border-border px-4 py-3 font-semibold">XL</td>
                  <td className="border border-border px-4 py-3">40</td>
                  <td className="border border-border px-4 py-3">34</td>
                  <td className="border border-border px-4 py-3">42</td>
                  <td className="border border-border px-4 py-3">44</td>
                </tr>
                <tr className="bg-secondary/30">
                  <td className="border border-border px-4 py-3 font-semibold">XXL</td>
                  <td className="border border-border px-4 py-3">42</td>
                  <td className="border border-border px-4 py-3">36</td>
                  <td className="border border-border px-4 py-3">44</td>
                  <td className="border border-border px-4 py-3">45</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-secondary rounded">
            <h3 className="font-semibold text-foreground mb-2">Measurement Tips:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use a soft measuring tape</li>
              <li>• Measure across the fullest part</li>
              <li>• Keep the tape snug but not tight</li>
              <li>• Compare with a garment you already own</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-primary-foreground rounded font-medium hover:opacity-90 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
